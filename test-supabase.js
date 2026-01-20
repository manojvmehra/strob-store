import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rmnurlgkyrumdkvihhwd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbnVybGdreXJ1bWRrdmloaHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2OTY4NjAsImV4cCI6MjA3OTI3Mjg2MH0.ZL92YMK63alncXcujZqhE4umOzz3AsGmmrvy4L0Le3w'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    console.log("Testing connection to:", supabaseUrl);
    try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        if (error) {
            console.error("Supabase Error:", error);
        } else {
            console.log("Connection successful!");
        }
    } catch (err) {
        console.error("Network/Client Error:", err);
    }
}

testConnection();
