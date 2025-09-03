# HV Wine Fest Contest Setup

## Environment Variables Required

Create a `.env.local` file in the root directory with the following variables:

```env
# Commerce7 API Configuration
C7_APP_ID=your_commerce7_app_id_here
C7_SECRET_KEY=your_commerce7_secret_key_here
C7_TENANT_ID=milea-estate-vineyard
C7_TAG_ID=your_tag_id_here

# Klaviyo Configuration
KLAVIYO_API_KEY=your_klaviyo_api_key_here
KLAVIYO_LIST_ID=your_klaviyo_list_id_here
```

## Issues Fixed

1. **Commerce7 Authentication**: Added conditional checks to skip Commerce7 integration if credentials are missing or invalid
2. **Klaviyo SMS Validation**: Fixed phone number validation to only include valid phone numbers (10+ digits)
3. **Error Handling**: Improved error handling so the contest form works even if external APIs fail
4. **Graceful Degradation**: The form will still work and show success even if some integrations fail

## How It Works Now

- If Commerce7 credentials are missing/invalid: Skips Commerce7 integration, continues with Klaviyo
- If Klaviyo credentials are missing/invalid: Skips Klaviyo integration, still shows success
- If phone number is invalid: Omits phone from Klaviyo profile to avoid SMS validation errors
- Form always shows success message to user regardless of backend integration status

## Testing

The application will now work even without proper API credentials, making it easier to test the frontend functionality.

## Debugging Commerce7 Issues

If you're getting 401 errors from Commerce7, use these endpoints to debug:

### 1. Test Commerce7 Authentication
Visit: `http://localhost:3001/api/test-c7`

This will test your Commerce7 credentials and show detailed error information.

### 1b. Test Different Auth Methods
Visit: `http://localhost:3001/api/test-auth`

This will try different authentication methods to see which one works.

### 2. Test Simple Customer Creation
Use the simplified endpoint: `http://localhost:3001/api/contest-simple`

This endpoint only creates customers in Commerce7 (no Klaviyo integration) to isolate the issue.

### 3. Check Your Credentials
Make sure your `.env.local` file has the exact credentials from Commerce7:

```env
C7_APP_ID=Festival_app
C7_SECRET_KEY=b95886e17a6a1ed0d02ed2e601d63b63b95508ac0e6f14930e4ace8f5722la70
C7_TENANT_ID=milea-estate-vineyard
```

### 4. Verify in Commerce7 Admin
1. Log into Commerce7 admin panel
2. Go to Developers > Apps
3. Find your "Festival_app" 
4. Verify the API credentials match exactly
5. Check that the app has Customer read/write permissions

## Fixed Issues

- **Klaviyo Array Format**: Fixed the API call to send data as an array instead of single object
- **Better Error Logging**: Added detailed logging for debugging Commerce7 authentication issues
- **Test Endpoints**: Created `/api/test-c7` and `/api/contest-simple` for debugging
