import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dkgoldavaugiuiepqcdr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZ29sZGF2YXVnaWl1ZXBxY2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Nzg5NzcsImV4cCI6MjA3ODU1NDk3N30.1EeCDLSezNg9VmpJHi9XB9XlnXREDHdFjLe0CIBtINk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
