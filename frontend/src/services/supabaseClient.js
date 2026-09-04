import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sowpmmppvvrxhxtvrsfe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvd3BtbXBwdnZyeGh4dHZyc2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MzAyNDYsImV4cCI6MjEwNDAwNjI0Nn0.1Jr456wwHOfXfe3QM6cc6JlHkFw527-zr9Wy_v25j7I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
