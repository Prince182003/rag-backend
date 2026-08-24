const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const BREVO_API_KEY = process.env.BREVO_API_KEY || 'YOUR_BREVO_API_KEY_HERE';

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).json({ status: 'Online', message: 'RAG Platform Backend is running successfully!' });
});

// OTP Sending Route via Brevo
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Generate random 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: "RAG Platform", email: "prince@bharatcabs.com" },
            to: [{ email: email }],
            subject: "Your RAG Verification Code",
            htmlContent: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4f46e5;">RAG Platform Verification</h2>
                    <p>Use the code below to complete your registration:</p>
                    <div style="background: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; border-radius: 8px;">
                        ${otpCode}
                    </div>
                    <p style="font-size: 12px; color: #666; margin-top: 20px;">This code is valid for 5 minutes. Do not share it with anyone.</p>
                </div>
            `
        }, {
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            }
        });

        res.status(200).json({ success: true, message: 'OTP sent successfully to your email.' });
    } catch (error) {
        console.error('Brevo API Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: 'Failed to send OTP email.' });
    }
});

app.listen(PORT, () => {
    console.log(`RAG Server is listening on port ${PORT}`);
});