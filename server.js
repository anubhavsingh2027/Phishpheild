import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

dotenv.config();

// Setup __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  secure: true,
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email transporter is ready.');
  }
});

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle feedback form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Admin email
  const adminMailOptions = {
    from: email,
    to: process.env.GMAIL_USER,
    subject: `New PhishShield Feedback by ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nFeedback: ${message}`
  };

  // Confirmation to user
  const userMailOptions = {
    from: `"PhishShield Team" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Thank you for Feedback PhishShield!',
    text: `Hi ${name},

Thank you for your valuable feedback! We have successfully received your message and our team will get back to you shortly.

Here’s a copy of the message you submitted:

Name: ${name}
Email: ${email}
Message: ${message}

We appreciate your input—it helps us improve PhishShield to better protect and educate users like you.

If you need any further assistance, feel free to reach out to us at anubhavsingh2027@gmail.com.

Best regards,  
PhishShield Team  
Developer: Anubhav Singh
`
  };

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);
    res.json({ message: 'Email sent successfully. Confirmation sent to user.' });
  } catch (err) {
    console.error('❌ Failed to send email:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

// Malicious URL Scanner
app.post('/api/scan', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required.' });

  const safeUrl = url.replace(/(["'$`\\])/g, '\\$1');
  const scanScriptPath = path.join(__dirname, 'scan_url.py');

  const cmd = `python3 "${scanScriptPath}" "${safeUrl}"`;
  console.log('Running command:', cmd);

  exec(cmd, (error, stdout, stderr) => {
    if (stderr) {
      console.error('Python stderr:', stderr);
    }

    if (error) {
      console.error('Error running Python scan:', error);
      return res.status(500).json({ error: 'Failed to scan URL.' });
    }

    console.log("Python output:", stdout);
    const result = stdout.trim();

    if (result === "MALICIOUS") {
      return res.json({ malicious: true });
    } else if (result === "SAFE") {
      return res.json({ malicious: false });
    } else {
      return res.status(500).json({ error: 'Invalid scan result.' });
    }
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
