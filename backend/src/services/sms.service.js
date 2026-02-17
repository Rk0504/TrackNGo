const axios = require('axios');

/**
 * Send WhatsApp message using Meta Cloud API (FREE tier: 1000 msgs/month)
 * Setup: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
 */
async function sendWhatsAppCloudAPI(mobile, message) {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
        console.warn('[WhatsApp] Meta Cloud API not configured. Skipping WhatsApp.');
        return { success: false, message: 'WhatsApp service not configured' };
    }

    try {
        // Format mobile number (remove leading 0 if present, add country code if missing)
        let formattedMobile = mobile.replace(/^0+/, ''); // Remove leading zeros
        if (!formattedMobile.startsWith('91')) {
            formattedMobile = '91' + formattedMobile; // Add India country code
        }

        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
            {
                messaging_product: 'whatsapp',
                to: formattedMobile,
                type: 'text',
                text: { body: message }
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`[WhatsApp] Sent to ${formattedMobile}:`, response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('[WhatsApp] Failed to send:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

/**
 * Send WhatsApp message using Twilio API
 * Setup: https://www.twilio.com/docs/whatsapp
 */
async function sendWhatsAppTwilio(mobile, message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio sandbox

    if (!accountSid || !authToken) {
        console.warn('[WhatsApp] Twilio not configured. Skipping WhatsApp.');
        return { success: false, message: 'Twilio service not configured' };
    }

    try {
        // Format mobile number
        let formattedMobile = mobile.replace(/^0+/, '');
        if (!formattedMobile.startsWith('+')) {
            formattedMobile = '+91' + formattedMobile; // Add India country code
        }

        const response = await axios.post(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            new URLSearchParams({
                From: fromNumber,
                To: `whatsapp:${formattedMobile}`,
                Body: message
            }),
            {
                auth: { username: accountSid, password: authToken },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        console.log(`[WhatsApp] Twilio sent to ${formattedMobile}:`, response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('[WhatsApp] Twilio failed:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

/**
 * Send SMS using Fast2SMS API
 * Sign up at https://www.fast2sms.com/ to get your API key
 */
async function sendSMSFast2SMS(mobile, message) {
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
        console.warn('[SMS] Fast2SMS API key not configured. Skipping SMS.');
        return { success: false, message: 'SMS service not configured' };
    }

    try {
        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
            route: 'q',
            message: message,
            language: 'english',
            flash: 0,
            numbers: mobile
        }, {
            headers: {
                'authorization': apiKey,
                'Content-Type': 'application/json'
            }
        });

        console.log(`[SMS] Sent to ${mobile}:`, response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('[SMS] Failed to send SMS:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send SMS using MSG91 API
 * Sign up at https://msg91.com/ to get your auth key
 */
async function sendSMSMSG91(mobile, message) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const senderId = process.env.MSG91_SENDER_ID || 'TRKGO';

    if (!authKey) {
        console.warn('[SMS] MSG91 auth key not configured. Skipping SMS.');
        return { success: false, message: 'SMS service not configured' };
    }

    try {
        const response = await axios.get('https://api.msg91.com/api/sendhttp.php', {
            params: {
                authkey: authKey,
                mobiles: mobile,
                message: message,
                sender: senderId,
                route: 4, // Transactional route
                country: 91
            }
        });

        console.log(`[SMS] Sent to ${mobile}:`, response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('[SMS] Failed to send SMS:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Main function to send complaint confirmation message
 * Supports WhatsApp (preferred) and SMS (fallback)
 */
async function sendComplaintSMS(mobile, complaintId) {
    const message = `✅ Your complaint has been registered successfully!\n\n📋 Reference ID: *${complaintId}*\n\nTrack your complaint status at TrackNGo.\n\nThank you for helping improve our bus services! 🚌`;

    const provider = process.env.MESSAGING_PROVIDER || 'NONE';

    console.log(`[Messaging] Provider: ${provider}, Mobile: ${mobile}`);

    switch (provider) {
        case 'WHATSAPP_CLOUD':
            return await sendWhatsAppCloudAPI(mobile, message);

        case 'WHATSAPP_TWILIO':
            return await sendWhatsAppTwilio(mobile, message);

        case 'FAST2SMS':
            // Plain text for SMS (no markdown)
            const smsMessage = `Your complaint has been registered. Reference ID: ${complaintId}. Track at TrackNGo.`;
            return await sendSMSFast2SMS(mobile, smsMessage);

        case 'MSG91':
            const smsMsg = `Your complaint has been registered. Reference ID: ${complaintId}. Track at TrackNGo.`;
            return await sendSMSMSG91(mobile, smsMsg);

        default:
            console.log(`[Messaging] Mock message to ${mobile}:\n${message}`);
            return { success: true, mock: true, message: 'Message would be sent in production' };
    }
}

module.exports = {
    sendComplaintSMS
};
