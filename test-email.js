// Test script for Nodemailer setup
import nodemailer from 'nodemailer';
import 'dotenv/config';

console.log('Email test script starting...');

// Check if environment variables are loaded
console.log('Email configuration:', {
  emailUser: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}...` : 'not set',
  emailPass: process.env.EMAIL_PASS ? '[present]' : 'not set'
});

// Create test account if env vars not set (using Ethereal Email)
async function main() {
  console.log('Creating Nodemailer setup...');
  
  let testAccount;
  let transporter;
  
  // If no email credentials provided, create test account on Ethereal
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('No email credentials found, creating test account...');
    testAccount = await nodemailer.createTestAccount();
    
    console.log('Test account created:', {
      user: testAccount.user,
      pass: testAccount.pass
    });
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } else {
    // Use the actual email configuration
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  
  // Verify connection
  try {
    console.log('Verifying connection to mail server...');
    await transporter.verify();
    console.log('Server connection successful!');
  } catch (error) {
    console.error('Connection verification failed:', error);
    process.exit(1);
  }
  
  // Sample grievance data
  const grievanceData = {
    id: 'TEST-' + Math.floor(Math.random() * 10000),
    title: 'Test Grievance',
    category: 'Test Category',
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  // Create test email
  const testEmail = {
    from: `"GNDEC Grievance Portal Test" <${process.env.EMAIL_USER || testAccount.user}>`,
    to: process.env.TEST_EMAIL || process.env.EMAIL_USER || testAccount.user, // Send to yourself or test email
    subject: 'Test Grievance Confirmation Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">TEST - Grievance Submission Confirmation</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">Dear Student,</p>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">This is a TEST email. Your grievance has been successfully submitted to the administration. Here are the details:</p>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db;">
          <p style="margin: 5px 0;"><strong>Grievance ID:</strong> ${grievanceData.id}</p>
          <p style="margin: 5px 0;"><strong>Title:</strong> ${grievanceData.title}</p>
          <p style="margin: 5px 0;"><strong>Category:</strong> ${grievanceData.category}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> ${grievanceData.status}</p>
          <p style="margin: 5px 0;"><strong>Submitted on:</strong> ${new Date(grievanceData.created_at).toLocaleString()}</p>
        </div>
        
        <p style="color: #555; font-size: 16px; line-height: 1.5;">This is a test email to verify Nodemailer setup is working correctly.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #777; font-size: 14px;">This is an automated test message.</p>
          <p style="color: #777; font-size: 14px;">GNDEC Grievance Portal</p>
        </div>
      </div>
    `,
    text: `
      TEST - Grievance Submission Confirmation
      
      Dear Student,
      
      This is a TEST email. Your grievance has been successfully submitted to the administration. Here are the details:
      
      Grievance ID: ${grievanceData.id}
      Title: ${grievanceData.title}
      Category: ${grievanceData.category}
      Status: ${grievanceData.status}
      Submitted on: ${new Date(grievanceData.created_at).toLocaleString()}
      
      This is a test email to verify Nodemailer setup is working correctly.
      
      This is an automated test message.
      GNDEC Grievance Portal
    `
  };
  
  // Send the test email
  try {
    console.log('Sending test email...');
    const info = await transporter.sendMail(testEmail);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
    // If using Ethereal, log the preview URL
    if (testAccount) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      console.log('Open the above URL to view the test email');
    }
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error sending test email:', error);
    process.exit(1);
  }
}

// Run the test
main().catch(console.error); 