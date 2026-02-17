# SMS Notification Setup Guide

When a user submits a complaint, the system will automatically send an SMS to their registered mobile number containing the complaint Reference ID.

## Current Status

✅ **SMS Service is Configured** but set to `NONE` mode (mock/testing)

In this mode:
- Complaints are saved successfully
- SMS sending is simulated (logged to console, not actually sent)
- No SMS API charges

## To Enable Real SMS Sending

You need to sign up for an SMS service provider and configure the API keys.

### Option 1: Fast2SMS (Recommended for India)

1. **Sign up**: Visit https://www.fast2sms.com/ and create an account
2. **Get API Key**: 
   - Login to your Fast2SMS dashboard
   - Go to "API" section
   - Copy your API key
3. **Configure**:
   - Open `backend/.env`
   - Set `SMS_PROVIDER=FAST2SMS`
   - Set `FAST2SMS_API_KEY=your_api_key_here`
4. **Restart backend**: `npm start`

### Option 2: MSG91 (Alternative)

1. **Sign up**: Visit https://msg91.com/ and create an account
2. **Get Auth Key**:
   - Login to MSG91 dashboard
   - Go to "API" or "Settings"
   - Copy your auth key
3. **Configure**:
   - Open `backend/.env`
   - Set `SMS_PROVIDER=MSG91`
   - Set `MSG91_AUTH_KEY=your_auth_key_here`
   - Optionally set `MSG91_SENDER_ID=TRKGO` (or your registered sender ID)
4. **Restart backend**: `npm start`

## SMS Message Format

When a user submits a complaint, they receive:

```
Your complaint has been registered successfully. Reference ID: TN-XXXXXXXXX-XXXXX. Track your complaint status at TrackNGo.
```

## Testing Without Real SMS

The system is currently in **test mode** (`SMS_PROVIDER=NONE`).

When a complaint is submitted, you'll see in the backend console:
```
[SMS] Mock SMS to 9876543210: Your complaint has been registered...
```

This confirms the SMS logic is working without actually sending messages.

## Important Notes

1. **Costs**: SMS services charge per message. Check pricing on their websites.
2. **User Registration**: SMS is only sent if the user is logged in (has a user_id).
3. **Anonymous Complaints**: If someone submits without login, no SMS is sent.
4. **Testing**: Keep `SMS_PROVIDER=NONE` during development to avoid charges.

## Troubleshooting

**SMS not sending?**
- Check backend console for `[SMS]` logs
- Verify API key is correct in `.env`
- Ensure `SMS_PROVIDER` is set correctly
- Restart backend after changing `.env`

**User not receiving SMS?**
- Verify mobile number is correct in user registration
- Check SMS service dashboard for delivery status
- Ensure sufficient balance in SMS service account
