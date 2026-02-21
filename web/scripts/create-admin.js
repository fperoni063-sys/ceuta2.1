// Script to create admin user in Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lznffkzvqpbvllggmjwx.supabase.co';
// Using service role key to create users
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6bmZma3p2cXBidmxsZ2dtand4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgyMzU4NywiZXhwIjoyMDgxMzk5NTg3fQ.5Vs5_5wAIQKalhFsQNWNCS4nXoIwPNVQwiCEadUdw54';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdminUser() {
    const email = 'francoperoni196@gmail.com';
    const password = 'Uj$m2B@v9h2JeGk';

    console.log(`Creating admin user: ${email}...`);

    // First check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const existingUser = existingUsers.users.find(u => u.email === email);

    if (existingUser) {
        console.log('User already exists!');
        console.log('User ID:', existingUser.id);
        console.log('Email:', existingUser.email);
        console.log('Email confirmed:', existingUser.email_confirmed_at ? 'Yes' : 'No');

        // Update password if needed
        console.log('\nUpdating password...');
        const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
            password: password,
            email_confirm: true
        });

        if (error) {
            console.error('Error updating user:', error);
        } else {
            console.log('Password updated successfully!');
        }
        return;
    }

    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true // Skip email confirmation
    });

    if (error) {
        console.error('Error creating user:', error);
        return;
    }

    console.log('User created successfully!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
}

createAdminUser();
