import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { connectToDatabase } from '@/lib/db';
import nodemailer from 'nodemailer';

// Email configuration constants
const DEFAULT_EMAIL = 'std_grievance@gndec.ac.in';
const DEFAULT_NAME = 'GNDEC Grievance Portal';

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

  const { to, subject, body, cc, bcc } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ message: 'Missing required fields: to, subject, and body are required' });
  }

  try {
    // Create a transporter with std_grievance@gndec.ac.in settings
    // For production, use the std_grievance@gndec.ac.in account
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

    // Prepare email data
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"${DEFAULT_NAME}" <${DEFAULT_EMAIL}>`,
      to,
      subject,
      html: body,
      ...(cc && { cc }),
      ...(bcc && { bcc }),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Save email to database
    const db = await connectToDatabase();
    const emailsCollection = db.collection('emails');
    
    await emailsCollection.insertOne({
      from: DEFAULT_EMAIL,
      to,
      cc,
      bcc,
      subject,
      body,
      sentAt: new Date(),
      isRead: true,
      isStarred: false,
      isOutbound: true,
      messageId: info.messageId,
    });

    // If using Ethereal for testing, provide the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);

    return res.status(200).json({ 
      message: 'Email sent successfully',
      messageId: info.messageId,
      ...(previewUrl && { previewUrl })
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
} 