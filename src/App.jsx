import { useEffect, useState } from "react";

const EmailInbox = () => {
  const [emails, setEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const fetchEmails = () => {
    fetch("https://profideutschinbox.s3.eu-west-1.amazonaws.com/emails/index.json")
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
    alert(`This delete only works if you configure CORS + permissions in S3.\nKey: ${key}`);
    // You can implement actual deletion using a signed API or IAM-authenticated Lambda
  };

  if (!loggedIn) {
    return (
      <div style={{ padding: "2rem", fontFamily: "Arial" }}>
        <h2>Email Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        />
        <button onClick={() => setLoggedIn(true)} style={{ padding: "0.5rem 1rem" }}>
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
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Inbox</h1>
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      />
      <ul style={{ listStyle: "none", padding: 0 }}>
        {filtered.map((email, i) => (
          <li key={i} style={{ borderBottom: "1px solid #ccc", paddingBottom: "1rem", marginBottom: "1rem" }}>
            <div><strong>From:</strong> {email.from}</div>
            <div><strong>Subject:</strong> {email.subject}</div>
            <div><strong>Date:</strong> {email.date}</div>
            <a
              href={`https://profideutschinbox.s3.eu-west-1.amazonaws.com/${email.key}`}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              📥 Download
            </a>
            <br />
            <button onClick={() => handleDelete(email.key)} style={{ marginTop: "0.5rem", backgroundColor: "#f44336", color: "white", border: "none", padding: "0.5rem" }}>
              🗑 Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmailInbox;