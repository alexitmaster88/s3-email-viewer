const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const SES = new AWS.SES({ region: "eu-west-1" });

const BUCKET = "profideutschinbox";
const PREFIX = "emails/";
const INDEX_FILE = `${PREFIX}index.json`;
const FORWARD_TO = "profideutsch.uz@gmail.com";

exports.handler = async (event) => {
  for (const record of event.Records) {
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    if (!key.startsWith(PREFIX) || key.endsWith("index.json")) continue;

    const emailObject = await S3.getObject({ Bucket: BUCKET, Key: key }).promise();
    const emailData = emailObject.Body.toString("utf-8");

    // Forward email to Gmail
    await SES.sendRawEmail({
      Destinations: [FORWARD_TO],
      RawMessage: { Data: emailObject.Body }
    }).promise();

    // Extract basic email metadata
    const subject = (emailData.match(/Subject:(.*)/i) || [])[1]?.trim() || "No Subject";
    const from = (emailData.match(/From:(.*)/i) || [])[1]?.trim() || "Unknown";
    const date = (emailData.match(/Date:(.*)/i) || [])[1]?.trim() || new Date().toISOString();

    // Fetch current index.json
    let index = [];
    try {
      const indexObject = await S3.getObject({ Bucket: BUCKET, Key: INDEX_FILE }).promise();
      index = JSON.parse(indexObject.Body.toString("utf-8"));
    } catch (e) {
      if (e.code !== "NoSuchKey") throw e;
    }

    // Add new entry
    index.unshift({ key, subject, from, date, size: record.s3.object.size });

    // Save updated index.json
    await S3.putObject({
      Bucket: BUCKET,
      Key: INDEX_FILE,
      Body: JSON.stringify(index, null, 2),
      ContentType: "application/json"
    }).promise();
  }

  return { statusCode: 200, body: "Email processed and indexed." };
};