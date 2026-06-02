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

  // Get reply details from request body
  const { body, additionalRecipients } = req.body;

  if (!body) {
    return res.status(400).json({ message: 'Reply body is required' });
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

    // Prepare reply-all message
    const replySubject = originalEmail.subject.startsWith('Re:') 
      ? originalEmail.subject 
      : `Re: ${originalEmail.subject}`;
    
    // For reply-all: include original sender and all recipients except the current user
    let allRecipients = [originalEmail.from];
    
    // Add original CC recipients if they exist
    if (originalEmail.cc && Array.isArray(originalEmail.cc)) {
      allRecipients = [...allRecipients, ...originalEmail.cc];
    } else if (originalEmail.cc && typeof originalEmail.cc === 'string') {
      allRecipients.push(originalEmail.cc);
    }
    
    // Add original To recipients if they exist and are not the same as the from
    if (originalEmail.to && originalEmail.to !== originalEmail.from) {
      if (Array.isArray(originalEmail.to)) {
        allRecipients = [...allRecipients, ...originalEmail.to];
      } else if (typeof originalEmail.to === 'string') {
        allRecipients.push(originalEmail.to);
      }
    }
    
    // Add any additional recipients
    if (additionalRecipients && Array.isArray(additionalRecipients)) {
      allRecipients = [...allRecipients, ...additionalRecipients];
    } else if (additionalRecipients) {
      allRecipients.push(additionalRecipients);
    }
    
    // Update the recipient filtering to exclude the admin email instead of the session email
    const uniqueRecipients = [...new Set(allRecipients)].filter(
      email => email !== DEFAULT_EMAIL
    );
    
    // Create reply body with original message quoted
    const replyBody = `
      <div>${body}</div>
      <hr/>
      <div>
        <p>On ${new Date(originalEmail.sentAt).toLocaleString()}, ${originalEmail.from} wrote:</p>
        <blockquote style="padding-left: 1em; border-left: 4px solid #DDD;">
          ${originalEmail.body}
        </blockquote>
      </div>
    `;

    // Update the from field in mailOptions
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"${DEFAULT_NAME}" <${DEFAULT_EMAIL}>`,
      to: uniqueRecipients,
      subject: replySubject,
      html: replyBody,
      references: originalEmail.messageId,
      inReplyTo: originalEmail.messageId,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Update the database insertion to use the default email
    await emailsCollection.insertOne({
      from: DEFAULT_EMAIL,
      to: uniqueRecipients,
      subject: replySubject,
      body: replyBody,
      originalEmailId: id,
      sentAt: new Date(),
      isRead: true,
      isStarred: false,
      isOutbound: true,
      messageId: info.messageId,
      inReplyTo: originalEmail.messageId,
    });

    // If using Ethereal for testing, provide the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);

    return res.status(200).json({ 
      message: 'Reply-all sent successfully',
      messageId: info.messageId,
      ...(previewUrl && { previewUrl })
    });
  } catch (error) {
    console.error('Error sending reply-all:', error);
    return res.status(500).json({ message: 'Failed to send reply-all', error: error.message });
  }
} 