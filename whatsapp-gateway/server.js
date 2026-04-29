const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

let currentQR = null;
let currentState = 'disconnected';

app.use(bodyParser.json());

// Handle process level errors to prevent crashes
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize Client with LocalAuth for session persistence
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './sessions'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // Help with memory issues in Docker/Linux
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Use less memory
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('--- SCAN QR CODE BELOW TO LOGIN ---');
    currentQR = qr;
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Client is READY!');
    currentQR = null;
    currentState = 'connected';
});

client.on('authenticated', () => {
    console.log('WhatsApp AUTHENTICATED');
    currentQR = null;
});

client.on('auth_failure', (msg) => {
    console.error('WhatsApp AUTHENTICATION FAILURE', msg);
    currentQR = null;
    currentState = 'disconnected';
});

client.on('disconnected', (reason) => {
    console.log('WhatsApp Client was DISCONNECTED', reason);
    currentQR = null;
    currentState = 'disconnected';
    
    // Attempt re-initialization after a delay if it wasn't a manual logout
    if (reason !== 'NAVIGATION') {
        console.log('Attempting to re-initialize client in 5 seconds...');
        setTimeout(() => {
            client.initialize().catch(err => console.error('Retry init failed:', err));
        }, 5000);
    }
});

// API Endpoint to send message
app.post('/send-message', async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ status: 'error', message: 'Phone and message are required' });
    }

    if (currentState !== 'connected') {
        return res.status(503).json({ status: 'error', message: 'WhatsApp client is not connected' });
    }

    try {
        // Format phone number to WhatsApp ID
        let formattedPhone = String(phone).replace(/\D/g, ''); 
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '62' + formattedPhone.slice(1);
        }
        
        const chatId = formattedPhone + '@c.us';
        
        // Check registration
        const isRegistered = await client.isRegisteredUser(chatId);
        
        if (!isRegistered) {
            return res.status(404).json({ status: 'error', message: 'The number is not registered on WhatsApp' });
        }

        await client.sendMessage(chatId, message);
        res.json({ status: 'success', message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

const startTime = Date.now();

app.get('/status', (req, res) => {
    const memUsage = process.memoryUsage();
    res.json({ 
        status: currentState,
        qr: currentQR,
        uptime: Math.floor((Date.now() - startTime) / 1000),
        memory: {
            rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        },
        version: '1.0.1'
    });
});

app.post('/restart', async (req, res) => {
    try {
        console.log('Restarting WhatsApp Client...');
        currentState = 'disconnected';
        currentQR = null;
        
        try {
            await client.destroy();
        } catch (e) {
            console.log('Client already destroyed or not initialized');
        }
        
        const fs = require('fs');
        if (fs.existsSync('./sessions')) {
            try {
                fs.rmSync('./sessions', { recursive: true, force: true });
            } catch (e) {
                console.error('Error removing sessions:', e);
            }
        }
        
        client.initialize().catch(err => console.error('Restart init failed:', err));
        res.json({ status: 'success', message: 'Client restarting' });
    } catch (error) {
        console.error('Error restarting:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Initial start
client.initialize().catch(err => {
    console.error('Error during initial initialization:', err);
});

app.listen(port, () => {
    console.log(`WhatsApp Gateway API listening at http://localhost:${port}`);
});
