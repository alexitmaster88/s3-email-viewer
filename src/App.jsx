import { useEffect, useState } from "react";

const EmailInbox = () => {
  const [emails, setEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const fetchEmails = () => {
    fetch(
      "https://profideutschinbox.s3.eu-west-1.amazonaws.com/emails/index.json?fields=from,subject,date,key"
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEmails(data);
        } else if (data.emails) {
          setEmails(data.emails);
        }
      })
      .catch((err) => console.error("Fetch failed:", err));
  };

  useEffect(() => {
    if (loggedIn) {
      fetchEmails();
      const interval = setInterval(fetchEmails, 30000);
      return () => clearInterval(interval);
    }
  }, [loggedIn]);

  const handleDelete = (key) => {
    alert(
      `This delete only works if you configure CORS + IAM permissions in S3.\nFile key: ${key}`
    );
  };

  const handleSelect = (email) => {
    setSelectedEmail(email);
  };

  if (!loggedIn) {
    return (
      <div style={{ padding: "2rem", fontFamily: "Arial" }}>
        <h2>Login to Email Viewer</h2>
        <input
          type="email"
          placeholder="Email (must end with @profi-deutsch.uz)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        />
        <input
          type="password"
          placeholder="Password (any)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        />
        <button
          onClick={() => {
            if (email.endsWith("@profi-deutsch.uz")) {
              setLoggedIn(true);
            } else {
              alert("Only emails ending with @profi-deutsch.uz are allowed.");
            }
          }}
          style={{ padding: "0.5rem 1rem" }}
        >
          Login
        </button>
      </div>
    );
  }

  const filtered = emails.filter((email) =>
    (email.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (email.from || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", fontFamily: "Arial", height: "100vh" }}>
      <div style={{ width: "30%", padding: "1rem", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        <h2>Inbox</h2>
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        />
        <button onClick={() => setLoggedIn(false)} style={{ marginBottom: "1rem" }}>
          Logout
        </button>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtered.map((email, i) => (
            <li key={i} onClick={() => handleSelect(email)} style={{ cursor: "pointer", marginBottom: "1rem", borderBottom: "1px solid #eee" }}>
              <div><strong>From:</strong> {email.from}</div>
              <div><strong>Subject:</strong> {email.subject}</div>
              <div><strong>Date:</strong> {email.date}</div>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flexGrow: 1, padding: "1rem" }}>
        {selectedEmail ? (
          <div>
            <h3>{selectedEmail.subject}</h3>
            <p><strong>From:</strong> {selectedEmail.from}</p>
            <p><strong>Date:</strong> {selectedEmail.date}</p>
            <p><strong>Key:</strong> {selectedEmail.key}</p>
            <p style={{ fontStyle: "italic" }}>Body preview not available in browser-only mode.</p>
            <a
              href={`https://profideutschinbox.s3.eu-west-1.amazonaws.com/${selectedEmail.key}`}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              📥 Download original email
            </a>
            <br />
            <button onClick={() => handleDelete(selectedEmail.key)} style={{ marginTop: "1rem", backgroundColor: "#f44336", color: "white", border: "none", padding: "0.5rem" }}>
              🗑 Delete
            </button>
          </div>
        ) : (
          <p>Select an email to preview.</p>
        )}
      </div>
    </div>
  );
};

export default EmailInbox;