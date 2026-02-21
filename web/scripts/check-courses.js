// Script to check course data in Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lznffkzvqpbvllggmjwx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6bmZma3p2cXBidmxsZ2dtand4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjM1ODcsImV4cCI6MjA4MTM5OTU4N30.xO3LQmxYeO5S_Z4k41-JKLVZDOMMK7ETe4TdcO0IE4I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCourses() {
    console.log('Fetching courses from Supabase...\n');

    const { data, error } = await supabase
        .from('cursos')
        .select('id, nombre, slug, activo')
        .order('nombre');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Courses in database:');
    console.log('====================');
    data.forEach(c => {
        console.log(`ID: ${c.id} | Slug: "${c.slug}" | Activo: ${c.activo} | Nombre: ${c.nombre}`);
    });

    console.log('\n\nActive courses with empty/null slugs:');
    console.log('=====================================');
    const problemCourses = data.filter(c => c.activo && (!c.slug || c.slug.trim() === ''));
    if (problemCourses.length === 0) {
        console.log('None found');
    } else {
        problemCourses.forEach(c => {
            console.log(`ID: ${c.id} | Nombre: ${c.nombre}`);
        });
    }
}

checkCourses();
