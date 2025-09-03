import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const C7_APP_ID = process.env.C7_APP_ID;
    const C7_SECRET_KEY = process.env.C7_SECRET_KEY;
    const C7_TENANT_ID = process.env.C7_TENANT_ID;
    
    if (!C7_APP_ID || !C7_SECRET_KEY || !C7_TENANT_ID) {
      return NextResponse.json({
        error: 'Missing Commerce7 environment variables',
        hasAppId: !!C7_APP_ID,
        hasSecretKey: !!C7_SECRET_KEY,
        hasTenantId: !!C7_TENANT_ID
      }, { status: 400 });
    }
    
    // Create Basic Auth token
    const authString = `${C7_APP_ID}:${C7_SECRET_KEY}`;
    const basicAuthToken = Buffer.from(authString).toString('base64');
    
    console.log('=== Commerce7 Debug Info ===');
    console.log('App ID:', C7_APP_ID);
    console.log('Secret Key (first 20 chars):', C7_SECRET_KEY.substring(0, 20) + '...');
    console.log('Secret Key (last 20 chars):', '...' + C7_SECRET_KEY.substring(C7_SECRET_KEY.length - 20));
    console.log('Secret Key length:', C7_SECRET_KEY.length);
    console.log('Tenant ID:', C7_TENANT_ID);
    console.log('Auth string (first 30 chars):', authString.substring(0, 30) + '...');
    console.log('Basic token (first 40 chars):', basicAuthToken.substring(0, 40) + '...');
    console.log('============================');
    
    // Test with a simple customer list request
    const response = await axios.get(
      'https://api.commerce7.com/v1/customer?limit=1',
      {
        headers: {
          'Authorization': `Basic ${basicAuthToken}`,
          'Tenant': C7_TENANT_ID,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Commerce7 authentication successful',
      customerCount: response.data.customers?.length || 0,
      debug: {
        appId: C7_APP_ID,
        secretKeyLength: C7_SECRET_KEY.length,
        secretKeyPreview: C7_SECRET_KEY.substring(0, 10) + '...' + C7_SECRET_KEY.substring(C7_SECRET_KEY.length - 10),
        tenantId: C7_TENANT_ID,
        authStringPreview: authString.substring(0, 30) + '...',
        basicTokenPreview: basicAuthToken.substring(0, 40) + '...'
      }
    });
    
  } catch (error: any) {
    console.error('Commerce7 test error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    return NextResponse.json({
      success: false,
      error: 'Commerce7 authentication failed',
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      details: error.response?.data,
      debug: {
        appId: process.env.C7_APP_ID,
        secretKeyLength: process.env.C7_SECRET_KEY?.length,
        secretKeyPreview: process.env.C7_SECRET_KEY ? 
          process.env.C7_SECRET_KEY.substring(0, 10) + '...' + process.env.C7_SECRET_KEY.substring(process.env.C7_SECRET_KEY.length - 10) : 
          'MISSING',
        tenantId: process.env.C7_TENANT_ID,
        authStringPreview: process.env.C7_APP_ID && process.env.C7_SECRET_KEY ? 
          `${process.env.C7_APP_ID}:${process.env.C7_SECRET_KEY}`.substring(0, 30) + '...' : 
          'MISSING'
      }
    }, { status: 500 });
  }
}
