import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Define transporter with secure connection
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  secure: true, // Use secure connection
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error with email transporter:', error);
  } else {
    console.log('Email transporter is ready:', success);
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Email to admin
  const adminMailOptions = {
    from: email,
    to: process.env.GMAIL_USER,
    subject: `New PhishShield Customer  ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage:${message}`
  };

  // Confirmation email to the user
  const userMailOptions = {
    from: `"PhishShield Team " <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Thank you for contacting PhishShield!',
    text:`Hi ${name},

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
`,};

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);
    res.json({ message: 'Email sent successfully. Confirmation sent to user.' });
  } catch (err) {
    console.error('Failed to send email:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML page from 'public' directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
