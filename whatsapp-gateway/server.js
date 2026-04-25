const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

let currentQR = null;

app.use(bodyParser.json());

// Initialize Client with LocalAuth for session persistence
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './sessions'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('--- SCAN QR CODE BELOW TO LOGIN ---');
    currentQR = qr;
    qrcode.generate(qr, { small: true });
});

let currentState = 'disconnected';

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
});

// API Endpoint to send message
app.post('/send-message', async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ status: 'error', message: 'Phone and message are required' });
    }

    try {
        // Format phone number to WhatsApp ID (628123... -> 628123...@c.us)
        let formattedPhone = String(phone).replace(/\D/g, ''); // Remove non-digits
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '62' + formattedPhone.slice(1);
        }
        
        const chatId = formattedPhone + '@c.us';
        
        // Check if number is registered on WA
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

app.get('/status', (req, res) => {
    res.json({ 
        status: currentState,
        qr: currentQR
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
            fs.rmSync('./sessions', { recursive: true, force: true });
        }
        
        client.initialize();
        res.json({ status: 'success', message: 'Client restarting' });
    } catch (error) {
        console.error('Error restarting:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

client.initialize();

app.listen(port, () => {
    console.log(`WhatsApp Gateway API listening at http://localhost:${port}`);
});
