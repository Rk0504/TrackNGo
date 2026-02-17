# WhatsApp Notification Setup Guide 📱✨

Send complaint reference IDs to users via **WhatsApp** instead of SMS!

## Why WhatsApp?

✅ **FREE** - Meta Cloud API: 1000 messages/month FREE  
✅ **Better delivery** - Higher open rates than SMS  
✅ **Rich formatting** - Bold text, emojis, links  
✅ **Instant** - Faster delivery than SMS  
✅ **Preferred by users** - Most people use WhatsApp daily  

---

## Option 1: WhatsApp Cloud API (RECOMMENDED - FREE) 🎉

**Best for:** Production use, FREE tier, official Meta solution

### Step-by-Step Setup:

#### 1. Create Meta Business Account
- Go to https://business.facebook.com/
- Create a new Business Account (if you don't have one)
- Verify your business

#### 2. Set Up WhatsApp Cloud API
- Visit https://developers.facebook.com/apps/
- Click "Create App"
- Select "Business" as app type
- Add "WhatsApp" product to your app

#### 3. Get Phone Number
- In WhatsApp settings, you'll get a **Test Phone Number** (instant, free)
- OR register your own business phone number (requires verification)

#### 4. Generate Access Token
- Go to WhatsApp > API Setup
- Copy the **Temporary Access Token** 
  - Valid for 24 hours (for testing)
  - Generate **Permanent Access Token** for production
- Copy the **Phone Number ID**

#### 5. Configure TrackNGo
Edit `backend/.env`:
```bash
MESSAGING_PROVIDER=WHATSAPP_CLOUD
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
```

#### 6. Test It!
- Restart backend: `npm start`
- Register a user with YOUR mobile number
- Submit a complaint
- You'll receive WhatsApp message! 🎉

### Important Notes:
- **Free Tier**: 1000 conversations/month (enough for most use cases)
- **Test Mode**: You can send to max 5 numbers during testing
- **Production**: Submit app for review to send to any number
- **Message Template**: For marketing messages, you need approved templates
  - For transactional messages (like our complaint IDs), no template needed!

---

## Option 2: Twilio WhatsApp (Easier Setup, Paid)

**Best for:** Quick testing, easier approval process

### Setup Steps:

#### 1. Create Twilio Account
- Visit https://www.twilio.com/try-twilio
- Sign up for free trial (gets $15 credit)

#### 2. Set Up WhatsApp Sandbox
- Go to Messaging > Try it out > Send a WhatsApp message
- Enable WhatsApp Sandbox
- Follow instructions to connect your phone

#### 3. Get Credentials
- From Twilio Console, copy:
  - Account SID
  - Auth Token
  - WhatsApp Sandbox Number

#### 4. Configure TrackNGo
Edit `backend/.env`:
```bash
MESSAGING_PROVIDER=WHATSAPP_TWILIO
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

#### 5. Test & Deploy
- Restart backend
- Test with complaint submission
- For production: Buy dedicated WhatsApp number from Twilio

### Pricing:
- **Free Trial**: $15 credit (approx 300 messages)
- **After Trial**: ~₹0.50-1 per message
- **Cheaper than SMS** but not free like Cloud API

---

## Current Status: Test Mode

Right now, `MESSAGING_PROVIDER=NONE` (test mode).

When a complaint is submitted, you'll see in backend console:
```
[Messaging] Mock message to 9876543210:
✅ Your complaint has been registered successfully!

📋 Reference ID: *TN-XXXXXXXXX-XXXXX*

Track your complaint status at TrackNGo.

Thank you for helping improve our bus services! 🚌
```

---

## Message Format

WhatsApp messages include:
- ✅ Success indicator
- 📋 Reference ID with bold formatting
- 🚌 Friendly emoji
- Clear call-to-action

SMS fallback (plain text only):
- "Your complaint has been registered. Reference ID: TN-XXX..."

---

## Testing Checklist

1. ✅ Set `MESSAGING_PROVIDER` in `.env`
2. ✅ Add credentials (access token, phone ID, etc.)
3. ✅ Restart backend: `npm start`
4. ✅ Register with YOUR mobile number
5. ✅ Submit a test complaint
6. ✅ Check WhatsApp for message
7. ✅ Verify Reference ID matches database

---

## Troubleshooting

### WhatsApp Cloud API Issues

**❌ "WhatsApp service not configured"**
- Check `WHATSAPP_ACCESS_TOKEN` is set
- Check `WHATSAPP_PHONE_NUMBER_ID` is set
- Restart backend after updating `.env`

**❌ "Invalid access token"**
- Token might be expired (24h for test tokens)
- Generate permanent token for production

**❌ "Recipient not in allowed list"**
- In test mode, max 5 recipients
- Add recipient in Meta App Dashboard
- OR submit app for review

### Twilio Issues

**❌ "Could not connect to Twilio"**
- Verify Account SID and Auth Token
- Check Twilio account is active
- Ensure WhatsApp Sandbox is enabled

**❌ User didn't receive message**
- User must first send "join <code>" to sandbox number
- Check Twilio logs for delivery status

---

## Cost Comparison

| Method | Free Tier | After Free | Best For |
|--------|-----------|------------|----------|
| **WhatsApp Cloud** | 1000/month | ₹0.30/msg | Production |
| **Twilio WhatsApp** | $15 credit | ₹0.50-1/msg | Quick test |
| **Fast2SMS** | No free tier | ₹0.15/msg | SMS only |
| **MSG91** | No free tier | ₹0.12/msg | SMS only |

---

## Recommendations

🥇 **For Production**: Use **WhatsApp Cloud API**  
   - Free up to 1000 messages/month
   - Official Meta solution
   - No per-message charges

🥈 **For Testing**: Use **Test Mode** (current setting)  
   - No setup required
   - See logs in console
   - No costs

🥉 **Quick POC**: Use **Twilio WhatsApp**  
   - 5-minute setup
   - Works immediately
   - $15 free credit

---

## Need Help?

1. **WhatsApp Cloud API Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
2. **Twilio WhatsApp Docs**: https://www.twilio.com/docs/whatsapp/quickstart
3. **Video Tutorial**: Search "WhatsApp Cloud API setup" on YouTube

---

✨ **WhatsApp is ready to use!** Just configure your preferred provider and restart the backend.
