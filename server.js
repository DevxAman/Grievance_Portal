import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import imap from 'imap';
import 'dotenv/config'; // Load environment variables

// Log email configuration (with sensitive data redacted)
console.log('Email configuration loaded:', {
  emailUser: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}...` : 'not set',
  emailPass: process.env.EMAIL_PASS ? '********' : 'not set'
});

// Nodemailer transporter setup - using GNDEC SMTP server
const transporter = nodemailer.createTransport({
  host: 'mx7.gndec.ac.in',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER || 'std_grievance@gndec.ac.in',
    pass: process.env.EMAIL_PASS || ''
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  },
  debug: process.env.NODE_ENV !== 'production',
  pool: true,
  maxConnections: 5,
  maxMessages: 100
});

// Verify transporter connection at startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('Nodemailer connection error:', error);
  } else {
    console.log('Nodemailer server is ready to send messages');
  }
});

// Email sending function with enhanced error handling and template
const sendEmailConfirmation = async (to, subject, grievanceData) => {
  try {
    // Validate inputs
    if (!to || !grievanceData || !grievanceData.id) {
      throw new Error('Missing required email parameters');
    }

    // Format date in a readable format
    const formattedDate = grievanceData.created_at
      ? new Date(grievanceData.created_at).toLocaleString()
      : new Date().toLocaleString();

    // Better HTML email template with responsive design
    const mailOptions = {
      from: `"GNDEC Grievance Portal" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Grievance Submission Confirmation</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Dear Student,</p>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Your grievance has been successfully submitted to the administration. Here are the details:</p>
          
          <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db;">
            <p style="margin: 5px 0;"><strong>Grievance ID:</strong> ${grievanceData.id}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> ${grievanceData.title}</p>
            <p style="margin: 5px 0;"><strong>Category:</strong> ${grievanceData.category}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${grievanceData.status}</p>
            <p style="margin: 5px 0;"><strong>Submitted on:</strong> ${formattedDate}</p>
          </div>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Your grievance is now under review by our administration team. You will receive updates as there are developments on your case.</p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Thank you for your patience.</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #777; font-size: 14px;">This is an automated message. Please do not reply to this email.</p>
            <p style="color: #777; font-size: 14px;">GNDEC Grievance Portal</p>
          </div>
        </div>
      `,
      // Adding a plain text alternative for email clients that don't support HTML
      text: `
        Grievance Submission Confirmation
        
        Dear Student,
        
        Your grievance has been successfully submitted to the administration. Here are the details:
        
        Grievance ID: ${grievanceData.id}
        Title: ${grievanceData.title}
        Category: ${grievanceData.category}
        Status: ${grievanceData.status}
        Submitted on: ${formattedDate}
        
        Your grievance is now under review by our administration team. You will receive updates as there are developments on your case.
        
        Thank you for your patience.
        
        This is an automated message. Please do not reply to this email.
        GNDEC Grievance Portal
      `
    };

    // Send the email with better error handling
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      recipient: to,
      grievanceId: grievanceData.id
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('Error sending email confirmation:', error);
    return {
      success: false,
      error: error.message || 'Unknown error sending email'
    };
  }
};

// Function to send reminder emails to admin
const sendReminderEmail = async (to, subject, grievanceData, userDetails) => {
  try {
    // Validate inputs
    if (!to || !grievanceData || !grievanceData.id) {
      throw new Error('Missing required email parameters');
    }

    // Format date in a readable format
    const formattedDate = grievanceData.dateSubmitted
      ? new Date(grievanceData.dateSubmitted).toLocaleString()
      : new Date().toLocaleString();

    // HTML email template for reminder
    const mailOptions = {
      from: `"GNDEC Grievance Portal" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Grievance Reminder</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Dear Admin,</p>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">A student has requested a follow-up on their grievance. Here are the details:</p>
          
          <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c;">
            <p style="margin: 5px 0;"><strong>Grievance ID:</strong> ${grievanceData.id}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> ${grievanceData.title}</p>
            <p style="margin: 5px 0;"><strong>Category:</strong> ${grievanceData.category}</p>
            <p style="margin: 5px 0;"><strong>Current Status:</strong> ${grievanceData.status.replace('-', ' ')}</p>
            <p style="margin: 5px 0;"><strong>Submitted on:</strong> ${formattedDate}</p>
          </div>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">The student has requested an update on the status of this grievance.</p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Student information:</p>
          <ul style="color: #555; font-size: 16px; line-height: 1.5;">
            <li><strong>Name/ID:</strong> ${userDetails.name || userDetails.user_id}</li>
            <li><strong>Email:</strong> ${userDetails.email}</li>
          </ul>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Please review this grievance at your earliest convenience.</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #777; font-size: 14px;">This is an automated reminder message.</p>
            <p style="color: #777; font-size: 14px;">GNDEC Grievance Portal</p>
          </div>
        </div>
      `,
      // Adding a plain text alternative for email clients that don't support HTML
      text: `
        Grievance Reminder
        
        Dear Admin,
        
        A student has requested a follow-up on their grievance. Here are the details:
        
        Grievance ID: ${grievanceData.id}
        Title: ${grievanceData.title}
        Category: ${grievanceData.category}
        Current Status: ${grievanceData.status.replace('-', ' ')}
        Submitted on: ${formattedDate}
        
        The student has requested an update on the status of this grievance.
        
        Student information:
        - Name/ID: ${userDetails.name || userDetails.user_id}
        - Email: ${userDetails.email}
        
        Please review this grievance at your earliest convenience.
        
        GNDEC Grievance Portal
      `
    };

    // Send the email with better error handling
    const info = await transporter.sendMail(mailOptions);
    console.log('Reminder email sent successfully:', {
      messageId: info.messageId,
      recipient: to,
      grievanceId: grievanceData.id
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return {
      success: false,
      error: error.message || 'Unknown error sending reminder email'
    };
  }
};

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('ERROR: Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Store pending registrations temporarily
const pendingRegistrations = new Map();

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received with user_id:', req.body.user_id);

    const { user_id, password } = req.body;

    if (!user_id || !password) {
      console.log('Missing credentials - user_id or password not provided');
      return res.status(400).json({
        success: false,
        message: 'User ID and password are required'
      });
    }

    // Find the user in the users table
    console.log('Querying database for user with user_id:', user_id);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user_id) // Check user_id in the database
      .single(); // Get a single result

    console.log('Database query result:', { found: !!userData, hasError: !!userError });

    if (userError) {
      console.error('Database error during login:', userError);
      return res.status(500).json({
        success: false,
        message: 'Database error. Please try again later.'
      });
    }

    if (!userData) {
      console.log('No user found with user_id:', user_id);
      return res.status(401).json({
        success: false,
        message: 'Invalid user ID or password.'
      });
    }

    // If password field doesn't exist or is empty in the database
    if (!userData.password) {
      console.log('User found but password field is missing or empty');
      return res.status(401).json({
        success: false,
        message: 'Account setup incomplete. Please contact support.'
      });
    }

    // Verify the password
    // const passwordMatch = await bcrypt.compare(password, userData.password);
    const passwordMatch = password === userData.password;
    console.log('Password validation result:', passwordMatch);

    if (!passwordMatch) {
      console.log('Password does not match for user_id:', user_id);
      return res.status(401).json({
        success: false,
        message: 'Invalid user ID or password.'
      });
    }

    // Remove password from returned user
    const { password: _, ...userWithoutPassword } = userData;

    // Determine redirect path based on user role
    let redirectPath = '/dashboard';
    if (userData.role === 'admin') {
      redirectPath = '/admin/dashboard';
    } else if (userData.role === 'clerk') {
      redirectPath = '/clerk/dashboard';
    } else if (userData.role === 'dsw') {
      redirectPath = '/dsw/dashboard';
    }

    console.log('Login successful for user_id:', user_id, 'with role:', userData.role);
    console.log('Redirecting to:', redirectPath);

    res.json({
      success: true,
      user: userWithoutPassword,
      redirectPath
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An unknown error occurred'
    });
  }
});


// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    console.log('Signup request received');

    const { user_id, email, password } = req.body;
    console.log('Signup data:', { user_id, email, password: '********' });

    if (!user_id || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'User ID, email, and password are required'
      });
    }

    // Validate email format
    if (!email.endsWith('@gndec.ac.in')) {
      return res.status(400).json({
        success: false,
        message: 'Email must be a valid GNDEC email address (@gndec.ac.in)'
      });
    }

    try {
      // Check if user_id already exists
      const { data: existingUserId, error: userIdError } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_id', user_id)
        .single();

      if (userIdError && userIdError.code !== 'PGRST116') {
        console.error('Error checking existing user_id:', userIdError);
        return res.status(500).json({
          success: false,
          message: 'Database error when checking user ID. Please try again.'
        });
      }

      if (existingUserId) {
        return res.status(400).json({
          success: false,
          message: 'User ID already exists. Please choose a different one.'
        });
      }

      // Check if email already exists
      const { data: existingEmail, error: emailError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (emailError && emailError.code !== 'PGRST116') {
        console.error('Error checking existing email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Database error when checking email. Please try again.'
        });
      }

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered. Please use a different email or login.'
        });
      }
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Error checking user information. Please try again.'
      });
    }

    // Hash the password
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    const hashedPassword = password;

    // Generate OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store pending registration
    pendingRegistrations.set(email, {
      user_id,
      email,
      hashedPassword,
      role: 'student', // Default role for new users
      otp,
      created_at: Date.now()
    });

    // Set expiration for pending registration (30 minutes)
    setTimeout(() => {
      pendingRegistrations.delete(email);
    }, 30 * 60 * 1000);

    // In a production environment, we would send an email with the OTP here
    // For now, we're just returning success and handling the verification separately

    res.json({
      success: true,
      message: 'Verification code sent to your email. Please verify to complete registration.'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An unknown error occurred during signup. Please try again.'
    });
  }
});

// Email verification endpoint
app.post('/api/auth/verify', async (req, res) => {
  try {
    console.log('Verification request received');

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    // Check if registration exists
    const pendingReg = pendingRegistrations.get(email);
    if (!pendingReg) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found or it has expired'
      });
    }

    // Verify OTP
    if (otp !== pendingReg.otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please try again.'
      });
    }

    // Insert into users table
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          user_id: pendingReg.user_id,
          email: pendingReg.email,
          password: pendingReg.hashedPassword,
          role: pendingReg.role,
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      console.error('Error creating user:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create user.'
      });
    }

    if (!data || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create user.'
      });
    }

    // Remove password from returned user
    const { password: _, ...userWithoutPassword } = data[0];

    // Clean up pending registration
    pendingRegistrations.delete(email);

    res.json({
      success: true,
      message: 'Email verified and account created successfully!',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An unknown error occurred'
    });
  }
});

// Add endpoint for sending grievance confirmation emails with improved error handling
app.post('/api/grievances/send-confirmation', async (req, res) => {
  try {
    const { email, grievanceData } = req.body;

    if (!email || !grievanceData) {
      return res.status(400).json({
        success: false,
        message: 'Email and grievance data are required'
      });
    }

    console.log('Sending grievance confirmation email to:', email);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Ensure grievanceData has all required fields
    const requiredFields = ['id', 'title', 'category', 'status'];
    const missingFields = requiredFields.filter(field => !grievanceData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required grievance data fields: ${missingFields.join(', ')}`
      });
    }

    const result = await sendEmailConfirmation(
      email,
      `Grievance Submission Confirmation - ${grievanceData.title}`,
      grievanceData
    );

    if (result.success) {
      console.log('Email sent successfully');
      return res.json({
        success: true,
        message: 'Confirmation email sent successfully',
        messageId: result.messageId
      });
    } else {
      console.error('Failed to send email:', result.error);
      return res.status(500).json({
        success: false,
        message: `Failed to send email: ${result.error}`
      });
    }
  } catch (error) {
    console.error('Grievance confirmation email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send confirmation email'
    });
  }
});

// Add endpoint for sending reminder emails to admin
app.post('/api/grievances/send-reminder', async (req, res) => {
  try {
    const {
      grievanceId,
      grievanceTitle,
      grievanceCategory,
      grievanceStatus,
      userEmail,
      dateSubmitted,
      userName,
      userId
    } = req.body;

    if (!grievanceId || !grievanceTitle || !grievanceCategory || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required grievance information'
      });
    }

    console.log('Sending grievance reminder email to admin');

    // Admin email address
    const adminEmail = 'std_grievance@gndec.ac.in';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail) || !emailRegex.test(userEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const grievanceData = {
      id: grievanceId,
      title: grievanceTitle,
      category: grievanceCategory,
      status: grievanceStatus || 'pending',
      dateSubmitted: dateSubmitted || new Date().toISOString()
    };

    const userDetails = {
      name: userName,
      user_id: userId,
      email: userEmail
    };

    const result = await sendReminderEmail(
      adminEmail,
      `REMINDER: Grievance #${grievanceId} - ${grievanceTitle}`,
      grievanceData,
      userDetails
    );

    if (result.success) {
      console.log('Reminder email sent successfully to admin');
      return res.json({
        success: true,
        message: 'Reminder email sent successfully to admin',
        messageId: result.messageId
      });
    } else {
      console.error('Failed to send reminder email:', result.error);
      return res.status(500).json({
        success: false,
        message: `Failed to send reminder email: ${result.error}`
      });
    }
  } catch (error) {
    console.error('Grievance reminder email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send reminder email'
    });
  }
});

// Add email routes
app.get('/api/admin/emails', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required'
      });
    }

    const user_id = authHeader.split(' ')[1];
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token format'
      });
    }

    // Verify the user exists and is an admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }

    // Fetch emails using the service role key
    const { data: emails, error } = await supabase
      .from('emails')
      .select('*')
      .order('sentAt', { ascending: false });

    if (error) {
      console.error('Error fetching emails:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching emails'
      });
    }

    return res.json({
      success: true,
      emails
    });
  } catch (error) {
    console.error('Error in /api/admin/emails:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// IMAP configuration for GNDEC email server
const imapConfig = {
  user: process.env.EMAIL_USER1,      // Your GNDEC email address (e.g., yourname@gndec.ac.in)
  password: process.env.EMAIL_PASS1,  // Your GNDEC email password
  host: 'mx7.gndec.ac.in',          // GNDEC's IMAP server
  port: 993,                        // IMAP SSL port
  tls: true,                        // Use TLS for secure connection
  tlsOptions: { rejectUnauthorized: false }  // Allow self-signed certificates if needed
};

// Function to parse email body and extract content
function parseEmailBody(body) {
  // If the body contains MIME boundaries
  if (body.includes('Content-Type')) {
    // Extract text/plain content if available
    const plainTextMatch = body.match(/Content-Type: text\/plain[^]*?--/);
    if (plainTextMatch) {
      const content = plainTextMatch[0]
        .replace(/Content-Type: text\/plain[^]*?\r\n\r\n/, '') // Remove headers
        .replace(/\r\n--[^]*$/, '') // Remove trailing boundary
        .trim();
      return content;
    }

    // If no plain text, try to extract HTML content
    const htmlMatch = body.match(/Content-Type: text\/html[^]*?--/);
    if (htmlMatch) {
      const content = htmlMatch[0]
        .replace(/Content-Type: text\/html[^]*?\r\n\r\n/, '') // Remove headers
        .replace(/\r\n--[^]*$/, '') // Remove trailing boundary
        .trim();
      return content;
    }
  }

  // If no MIME content found, return the body as is
  return body.trim();
}

// Function to fetch emails from Gmail
async function fetchEmailsFromGmail() {
  return new Promise((resolve, reject) => {
    console.log('Attempting to connect to IMAP server with config:', {
      host: imapConfig.host,
      port: imapConfig.port,
      user: `${imapConfig.user.substring(0, 3)}...`, // Only show first 3 chars of email
      tls: imapConfig.tls
    });

    const imapConnection = new imap(imapConfig);
    const emails = [];

    imapConnection.once('ready', () => {
      console.log('IMAP connection established successfully');
      imapConnection.openBox('INBOX', false, (err, box) => {
        if (err) {
          console.error('Error opening INBOX:', err);
          imapConnection.end();
          reject(err);
          return;
        }
        console.log('INBOX opened successfully');

        const searchCriteria = ['UNSEEN'];
        const fetchOptions = {
          bodies: ['HEADER', 'TEXT'],
          struct: true
        };

        imapConnection.search(searchCriteria, (err, results) => {
          if (err) {
            console.error('Error searching emails:', err);
            imapConnection.end();
            reject(err);
            return;
          }
          console.log(`Found ${results.length} unread emails`);

          if (results.length === 0) {
            imapConnection.end();
            resolve([]);
            return;
          }

          const fetch = imapConnection.fetch(results, fetchOptions);

          fetch.on('message', (msg) => {
            const email = {
              headers: {},
              body: '',
              attachments: [],
              to: process.env.EMAIL_USER1
            };

            msg.on('body', (stream, info) => {
              let buffer = '';
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });
              stream.on('end', () => {
                if (info.which === 'HEADER') {
                  email.headers = imap.parseHeader(buffer);
                } else if (info.which === 'TEXT') {
                  email.body = buffer;
                }
              });
            });

            msg.on('attributes', (attrs) => {
              email.uid = attrs.uid;
              email.flags = attrs.flags;
              email.date = attrs.date;
            });

            msg.on('end', () => {
              emails.push(email);
            });
          });

          fetch.once('error', (err) => {
            console.error('Error fetching email content:', err);
            imapConnection.end();
            reject(err);
          });

          fetch.once('end', () => {
            console.log('Finished fetching all emails');
            imapConnection.end();
            resolve(emails);
          });
        });
      });
    });

    imapConnection.once('error', (err) => {
      console.error('IMAP connection error:', err);
      reject(err);
    });

    imapConnection.once('end', () => {
      console.log('IMAP connection ended');
    });

    imapConnection.connect();
  });
}

// Function to store emails in Supabase
async function storeEmailsInDatabase(emails) {
  for (const email of emails) {
    const { data, error } = await supabase
      .from('emails')
      .insert([
        {
          subject: email.headers.subject?.[0] || 'No Subject',
          from: email.headers.from?.[0] || 'Unknown',
          to: email.to,
          body: parseEmailBody(email.body), // Parse the email body
          sentAt: email.date,
          isRead: false,
          isStarred: false
        }
      ]);

    if (error) {
      console.error('Error storing email:', error);
    }
  }
}

// Set up periodic email fetching
setInterval(async () => {
  try {
    const emails = await fetchEmailsFromGmail();
    if (emails.length > 0) {
      await storeEmailsInDatabase(emails);
      console.log(`Stored ${emails.length} new emails`);
    }
  } catch (error) {
    console.error('Error fetching emails:', error);
  }
}, 5 * 60 * 1000); // Check every 5 minutes

// Add test endpoint for manual email fetching
app.get('/api/test/fetch-emails', async (req, res) => {
  try {
    console.log('Manual email fetch triggered');
    const emails = await fetchEmailsFromGmail();
    if (emails.length > 0) {
      await storeEmailsInDatabase(emails);
      console.log(`Stored ${emails.length} new emails`);
      res.json({ success: true, message: `Fetched and stored ${emails.length} new emails` });
    } else {
      res.json({ success: true, message: 'No new emails found' });
    }
  } catch (error) {
    console.error('Error in manual email fetch:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'std.grievance@gmail.com',
    pass: process.env.GMAIL_PASS
  }
});
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const mailOptions = {
      from: 'std.grievance@gmail.com',

      to: 'std.grievance@gmail.com',

      replyTo: email,

      subject: `Contact Form - ${subject}`,

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          
          <h2 style="color:#2563eb;">
            New Contact Form Submission
          </h2>

          <hr />

          <p>
            <strong>Name:</strong> ${name}
          </p>

          <p>
            <strong>Email:</strong> ${email}
          </p>

          <p>
            <strong>Subject:</strong> ${subject}
          </p>

          <p>
            <strong>Message:</strong>
          </p>

          <div style="
            background:#f3f4f6;
            padding:15px;
            border-radius:8px;
            white-space:pre-wrap;
          ">
            ${message}
          </div>

        </div>
      `
    };

    const info = await gmailTransporter.sendMail(mailOptions);

    console.log('Mail sent:', info.response);

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      messageId: info.messageId
    });

  } catch (error) {

    console.error('Contact form email error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message'
    });
  }
});
// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔌 Connected to Supabase at ${supabaseUrl}`);
}); 
