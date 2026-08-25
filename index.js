const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(express.json());
app.use(cors());

// Serve static frontend files from root
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 10000;
const BREVO_API_KEY = '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';

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Real-Time Chat Handler via Socket.io
io.on('connection', (socket) => {
    console.log('A user connected for live chat:', socket.id);

    socket.on('user_message', (data) => {
        io.emit('admin_receive_message', data);
    });

    socket.on('admin_message', (data) => {
        io.emit('user_receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// OTP Sending Route via Brevo
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

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

// Use server.listen instead of app.listen for Socket.io
server.listen(PORT, () => {
    console.log(`RAG Server with Real-Time Chat is listening on port ${PORT}`);
});