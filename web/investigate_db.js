import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env.local manually
const envContent = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigate() {
  console.log("Checking analytics events for today...");
  
  // Get events from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('event_name, created_at, metadata')
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching events:", error);
  } else {
    console.log(`Found ${events.length} events today.`);
    
    // Group by event_name
    const summary = {};
    events.forEach(e => {
        summary[e.event_name] = (summary[e.event_name] || 0) + 1;
    });
    
    console.log("Summary:", summary);
    
    // Check if there are any step 1 complete
    const step1 = events.filter(e => e.event_name === 'enrollment_step_1_complete');
    console.log(`Step 1 completes today: ${step1.length}`);
  }
}

investigate();
