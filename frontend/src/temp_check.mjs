import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sowpmmppvvrxhxtvrsfe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvd3BtbXBwdnZyeGh4dHZyc2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MzAyNDYsImV4cCI6MjEwNDAwNjI0Nn0.1Jr456wwHOfXfe3QM6cc6JlHkFw527-zr9Wy_v25j7I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { error: err1 } = await supabase.from('files').insert({ invalid_column_xyz: 123 });
  console.log('Files error:', err1?.message);

  const { error: err2 } = await supabase.from('folders').insert({ invalid_column_xyz: 123 });
  console.log('Folders error:', err2?.message);
}

main();
