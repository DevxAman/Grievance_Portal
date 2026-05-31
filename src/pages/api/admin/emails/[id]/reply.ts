import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
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

  // Get email ID from the URL
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid email ID' });
  }

  // Get reply details from request body
  const { body, cc, bcc } = req.body;

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

    // Create test account for development (will be used if no SMTP credentials)
    let testAccount;
    let previewUrl;
    let messageId;
    
    try {
      // Prepare reply message
      const replySubject = originalEmail.subject.startsWith('Re:') 
        ? originalEmail.subject 
        : `Re: ${originalEmail.subject}`;
      
      // The recipient of the reply should be the sender of the original email
      const to = originalEmail.from;

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

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Using actual SMTP credentials if available
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gndec.ac.in',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || DEFAULT_EMAIL,
            pass: process.env.SMTP_PASS,
          },
        });

        // Send email
        const mailOptions = {
          from: process.env.EMAIL_FROM || `"${DEFAULT_NAME}" <${DEFAULT_EMAIL}>`,
          to,
          subject: replySubject,
          html: replyBody,
          references: originalEmail.messageId,
          inReplyTo: originalEmail.messageId,
          ...(cc && { cc }),
          ...(bcc && { bcc }),
        };
        
        const info = await transporter.sendMail(mailOptions);
        messageId = info.messageId;
        previewUrl = null;
      } else {
        // For development - using Ethereal email for testing
        testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        // Send email via Ethereal
        const mailOptions = {
          from: `"${DEFAULT_NAME} (Test)" <${testAccount.user}>`,
          to,
          subject: replySubject,
          html: replyBody,
          references: originalEmail.messageId,
          inReplyTo: originalEmail.messageId,
          ...(cc && { cc }),
          ...(bcc && { bcc }),
        };
        
        const info = await transporter.sendMail(mailOptions);
        messageId = info.messageId;
        previewUrl = nodemailer.getTestMessageUrl(info);
      }

      // Save reply to database regardless of sending method
      await emailsCollection.insertOne({
        from: DEFAULT_EMAIL,
        to,
        cc,
        bcc,
        subject: replySubject,
        body: replyBody,
        originalEmailId: id,
        sentAt: new Date(),
        isRead: true,
        isStarred: false,
        isOutbound: true,
        messageId,
        inReplyTo: originalEmail.messageId,
      });

      return res.status(200).json({ 
        message: 'Reply saved successfully',
        messageId,
        ...(previewUrl && { 
          previewUrl,
          note: 'Using test account - set up Thunderbird to send actual emails' 
        })
      });
    } catch (error: any) {
      // Handle email sending error but still save the draft
      await emailsCollection.insertOne({
        from: DEFAULT_EMAIL,
        to: originalEmail.from,
        cc,
        bcc,
        subject: originalEmail.subject.startsWith('Re:') 
          ? originalEmail.subject 
          : `Re: ${originalEmail.subject}`,
        body: `<div>${body}</div><hr/><div><p>(Original message not quoted due to error)</p></div>`,
        originalEmailId: id,
        sentAt: new Date(),
        isRead: true,
        isStarred: false,
        isOutbound: false, // Mark as not sent
        isDraft: true,
        error: error.message || 'Unknown error',
      });

      return res.status(207).json({ 
        message: 'Reply saved as draft but not sent',
        error: error.message || 'Failed to send email',
        thunderbirdNote: 'Configure Thunderbird to send emails directly'
      });
    }
  } catch (error: any) {
    console.error('Error handling reply:', error);
    return res.status(500).json({ 
      message: 'Failed to process reply', 
      error: error.message || 'Unknown error'
    });
  }
} 