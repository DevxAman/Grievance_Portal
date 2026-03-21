import { Grievance } from '../types';

/**
 * Send a confirmation email for a grievance submission using server-side nodemailer
 * @param email Recipient email address
 * @param grievanceData Data of the submitted grievance
 * @returns Promise resolving to success status and message
 */
export const sendGrievanceConfirmationEmail = async (
  email: string,
  grievanceData: Grievance,
  retryCount = 0
): Promise<{ success: boolean; message: string }> => {
  // Maximum number of retries
  const MAX_RETRIES = 2;
  
  try {
    // Validate inputs
    if (!email || !email.trim()) {
      throw new Error('Email address is required');
    }
    
    if (!grievanceData || !grievanceData.id) {
      throw new Error('Valid grievance data is required');
    }

    console.log('[ServerEmailService] Sending confirmation email for grievance:', grievanceData.id);
    
    // Make API call to server endpoint
    const response = await fetch('/api/grievances/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        grievanceData
      }),
      // Add timeout to prevent long hanging requests
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('[ServerEmailService] Email sent successfully');
      return { success: true, message: 'Confirmation email sent successfully' };
    } else {
      console.error('[ServerEmailService] Failed to send email:', result.message);
      
      // If the error is one that might be resolved by retrying (like a network error),
      // and we haven't exceeded max retries, try again
      if (retryCount < MAX_RETRIES && 
          (response.status >= 500 || response.status === 429 || response.status === 0)) {
        console.log(`[ServerEmailService] Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        
        // Exponential backoff: wait longer between each retry
        const backoffMs = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        
        // Recursive call with incremented retry count
        return sendGrievanceConfirmationEmail(email, grievanceData, retryCount + 1);
      }
      
      return { success: false, message: result.message || 'Failed to send email' };
    }
  } catch (error) {
    console.error('[ServerEmailService] Error sending confirmation email:', error);
    
    // Check if error is a timeout or network-related
    const isNetworkError = error instanceof Error && 
      (error.name === 'AbortError' || 
       error.message.includes('network') || 
       error.message.includes('connection'));
    
    // Retry for network errors if we haven't exceeded max retries
    if (isNetworkError && retryCount < MAX_RETRIES) {
      console.log(`[ServerEmailService] Network error, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
      
      // Exponential backoff
      const backoffMs = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      
      // Recursive call with incremented retry count
      return sendGrievanceConfirmationEmail(email, grievanceData, retryCount + 1);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to send confirmation email: ${errorMessage}` };
  }
}; 