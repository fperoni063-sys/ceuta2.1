const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '../.env.local');
console.log('Loading environment variables from:', envPath);

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
} catch (error) {
    console.error('Error reading .env.local:', error.message);
    process.exit(1);
}

console.log('Environment variables loaded from:', envPath);
console.log('SMTP Config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    // mask password
    pass: process.env.SMTP_PASSWORD ? '****' : 'MISSING'
});

async function testConnection() {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false // Sometimes needed for local dev, but we will see
            }
        });

        console.log('Attempting to verify connection...');
        const verification = await transporter.verify();
        console.log('Connection successful:', verification);
    } catch (error) {
        console.error('Connection FAILED:', error);
        // Print full error object for analysis
        console.error(JSON.stringify(error, null, 2));
    }
}

testConnection();
