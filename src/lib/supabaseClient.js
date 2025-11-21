import { createClient } from '@supabase/supabase-js'

// 1. Paste the URL here
const supabaseUrl = 'https://rmnurlgkyrumdkvihhwd.supabase.co'

// 2. Paste the long Key here
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbnVybGdreXJ1bWRrdmloaHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njm2OTY4NjAsImV4cCI6MjA4NTI3Mjg2MH0.ZL92YMK63alncXcujZqhE4umOzz3AsGmmrvy4L0Le3w'

export const supabase = createClient(supabaseUrl, supabaseKey)