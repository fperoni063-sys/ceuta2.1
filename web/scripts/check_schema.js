require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error:', error);
    } else {
        if (data.length > 0) {
            console.log('Columns in cursos table:', Object.keys(data[0]));
        } else {
            console.log('No data found, cannot infer columns.');
        }
    }
}

check();
