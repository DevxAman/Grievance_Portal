import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://fctejkznfjpojtubgwqd.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdGVqa3puZmpwb2p0dWJnd3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjcxNzE1MCwiZXhwIjoyMDg4MjkzMTUwfQ.4L14dXFJE9l7fSmhTo6NlWS_nzyyspgGCZGwjz6Nmcs';

console.log('Supabase URL:', supabaseUrl);
console.log('Using environment variables:', !!import.meta.env.VITE_SUPABASE_URL);

// Initialize the Supabase client with service role key for full access
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
    storageKey: 'gndec_supabase_auth',
    detectSessionInUrl: true,
  },
  realtime: {
    // Disable realtime subscriptions to avoid WebSocket connection errors
    enabled: false
  }
});

// Function to test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    // Try to fetch a small amount of data to test the connection
    const { data, error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      console.error('Supabase connection error:', error.message);
      return { success: false, message: error.message };
    }

    console.log('Supabase connection successful');
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return { success: false, message: String(error) };
  }
};

export default supabase; 