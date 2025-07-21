import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://duwczapcewamlfkrjstu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1d2N6YXBjZXdhbWxma3Jqc3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDA3ODEsImV4cCI6MjA2ODU3Njc4MX0.W4xikq5zYHy0Leqhu5QmQ3ytqMP0aqFVLDvlzblCNSU';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});