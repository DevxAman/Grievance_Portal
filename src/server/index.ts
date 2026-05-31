import { handleLogin, handleSignup, handleVerification } from '../lib/authEndpoints';

/**
 * Main request handler for the server
 * @param request The incoming request
 * @returns A Response object with the result
 */
export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  
  console.log(`Handling request to ${path}`);
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  try {
    // Authentication endpoints
    if (path.startsWith('/api/auth/')) {
      if (path === '/api/auth/login' && request.method === 'POST') {
        console.log('Processing login request');
        const response = await handleLogin(request);
        
        // Add CORS headers to the response
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
        
        return response;
      }
      
      if (path === '/api/auth/signup' && request.method === 'POST') {
        console.log('Processing signup request');
        const response = await handleSignup(request);
        
        // Add CORS headers to the response
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
        
        return response;
      }
      
      if (path === '/api/auth/verify' && request.method === 'POST') {
        console.log('Processing verification request');
        const response = await handleVerification(request);
        
        // Add CORS headers to the response
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
        
        return response;
      }
      
      // Unknown auth endpoint
      return new Response(
        JSON.stringify({ success: false, message: 'Endpoint not found' }),
        { status: 404, headers }
      );
    }
    
    // Default: not found
    return new Response(
      JSON.stringify({ success: false, message: 'Endpoint not found' }),
      { status: 404, headers }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown server error occurred' 
      }),
      { status: 500, headers }
    );
  }
}

// Make sure handleRequest is the default export as well
export default { handleRequest }; 