# HV Wine Fest Contest Setup

## Environment Variables Required

Create a `.env.local` file in the root directory with the following variables:

```env
# Commerce7 API Configuration
C7_APP_ID=your_commerce7_app_id_here
C7_SECRET_KEY=your_commerce7_secret_key_here
C7_TENANT_ID=milea-estate-vineyard
C7_TAG_ID=your_tag_id_here
```

## Issues Fixed

1. **Commerce7 Authentication**: Added conditional checks to skip Commerce7 integration if credentials are missing or invalid
2. **Commerce7 Validation**: Fixed validation errors for country code and metadata keys
3. **Error Handling**: Improved error handling for Commerce7 API calls
4. **Simplified Integration**: Removed Klaviyo integration - now Commerce7 only

## How It Works Now

- **Commerce7 Only**: The form now only integrates with Commerce7 for customer management
- **Customer Creation/Update**: Creates new customers or updates existing ones with contest tag
- **Tag Attachment**: Always ensures the contest tag is attached to customer profiles
- **Email Subscription**: Automatically sets email marketing status to "Subscribed"
- **Form Success**: Shows success message when Commerce7 integration completes

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
C7_SECRET_KEY=your_secret_key_here
C7_TENANT_ID=milea-estate-vineyard
C7_TAG_ID=bcef778b-9410-4c9d-9084-0bae9f46a89b
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
- **Commerce7 CRUD Operations**: Implemented comprehensive customer create/update with tag attachment and email subscription
- **Unified Commerce7 Function**: Created `createOrUpdateCustomerWithTag()` function for consistent customer management

## New Commerce7 Integration Features

### ✅ **Comprehensive Customer Management**
- **Create or Update**: Automatically detects existing customers and updates them
- **Tag Attachment**: Always ensures the contest tag (`C7_TAG_ID`) is attached to customer profiles
- **Email Subscription**: Automatically sets `emailMarketingStatus` to "Subscribed"
- **Phone Number Formatting**: Properly formats phone numbers with +1 prefix
- **Metadata Tracking**: Tracks contest entry source and date

### ✅ **Enhanced API Endpoints**
- **`/api/contest`**: Contest form with Commerce7 customer creation/update
- **`/api/contest-simple`**: Commerce7-only customer creation/update
- **`/api/test-c7-complete`**: Comprehensive testing endpoint for all Commerce7 operations

### ✅ **Robust Error Handling**
- **Detailed Logging**: Comprehensive error logging for debugging
- **Environment Validation**: Checks for all required Commerce7 environment variables
- **Response Metadata**: Returns detailed Commerce7 integration status information
- **Error Recovery**: Graceful handling of Commerce7 API failures

### ✅ **Commerce7 Validation Fixes**
- **Country Code**: Added `countryCode: 'US'` to all customer creation/update operations
- **Metadata Validation**: Filters out invalid metadata keys (contest_entry_date, contest_prize)
- **Phone Number Support**: Properly handles phone numbers with country code requirement
- **Tag Attachment**: Ensures contest tag is always attached to customer profiles
