import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get email ID from the URL
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid email ID' });
  }

  // Get forwarding details from request body
  const { to, additionalMessage, cc, bcc } = req.body;

  if (!to) {
    return res.status(400).json({ message: 'Missing recipient email address' });
  }

  try {
    // Connect to database
    const db = await connectToDatabase();
    const emailsCollection = db.collection('emails');
    
    // Find original email
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid email ID format' });
    }
    
    const originalEmail = await emailsCollection.findOne({ _id: objectId });
    
    if (!originalEmail) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Add the default email constants
    const DEFAULT_EMAIL = 'std_grievance@gndec.ac.in';
    const DEFAULT_NAME = 'GNDEC Grievance Portal';

    // Update the transporter code to use the default email
    // Create a transporter with std_grievance@gndec.ac.in settings
    let transporter;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Use configured SMTP settings (production)
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || DEFAULT_EMAIL,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Use Ethereal for testing/development
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // Prepare forwarded message
    const forwardSubject = `Fwd: ${originalEmail.subject}`;
    
    let forwardBody = '';
    
    // Add additional message if provided
    if (additionalMessage) {
      forwardBody += `<div>${additionalMessage}</div><hr/>`;
    }
    
    // Add forwarded message
    forwardBody += `
      <div>
        <p><b>-------- Forwarded Message --------</b></p>
        <p><b>Subject:</b> ${originalEmail.subject}</p>
        <p><b>Date:</b> ${new Date(originalEmail.sentAt).toLocaleString()}</p>
        <p><b>From:</b> ${originalEmail.from}</p>
        <p><b>To:</b> ${originalEmail.to}</p>
        ${originalEmail.cc ? `<p><b>Cc:</b> ${originalEmail.cc}</p>` : ''}
        <hr/>
        ${originalEmail.body}
      </div>
    `;

    // Update the from field in mailOptions
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"${DEFAULT_NAME}" <${DEFAULT_EMAIL}>`,
      to,
      subject: forwardSubject,
      html: forwardBody,
      ...(cc && { cc }),
      ...(bcc && { bcc }),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Update the database insertion to use the default email
    await emailsCollection.insertOne({
      from: DEFAULT_EMAIL,
      to,
      cc,
      bcc,
      subject: forwardSubject,
      body: forwardBody,
      originalEmailId: id,
      sentAt: new Date(),
      isRead: true,
      isStarred: false,
      isOutbound: true,
      messageId: info.messageId,
    });

    // If using Ethereal for testing, provide the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);

    return res.status(200).json({ 
      message: 'Email forwarded successfully',
      messageId: info.messageId,
      ...(previewUrl && { previewUrl })
    });
  } catch (error) {
    console.error('Error forwarding email:', error);
    return res.status(500).json({ message: 'Failed to forward email', error: error.message });
  }
} 