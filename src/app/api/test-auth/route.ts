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
    
    // Test different authentication approaches
    const results = [];
    
    // Method 1: Standard Basic Auth
    try {
      const authString1 = `${C7_APP_ID}:${C7_SECRET_KEY}`;
      const basicToken1 = Buffer.from(authString1).toString('base64');
      
      const response1 = await axios.get(
        'https://api.commerce7.com/v1/customer?limit=1',
        {
          headers: {
            'Authorization': `Basic ${basicToken1}`,
            'Tenant': C7_TENANT_ID,
            'Content-Type': 'application/json'
          }
        }
      );
      
      results.push({
        method: 'Standard Basic Auth',
        success: true,
        customerCount: response1.data.customers?.length || 0
      });
    } catch (error: any) {
      results.push({
        method: 'Standard Basic Auth',
        success: false,
        error: error.response?.status,
        message: error.response?.data?.message
      });
    }
    
    // Method 2: Try with different header format
    try {
      const authString2 = `${C7_APP_ID}:${C7_SECRET_KEY}`;
      const basicToken2 = Buffer.from(authString2).toString('base64');
      
      const response2 = await axios.get(
        'https://api.commerce7.com/v1/customer?limit=1',
        {
          headers: {
            'Authorization': `Basic ${basicToken2}`,
            'X-Tenant': C7_TENANT_ID,
            'Content-Type': 'application/json'
          }
        }
      );
      
      results.push({
        method: 'X-Tenant Header',
        success: true,
        customerCount: response2.data.customers?.length || 0
      });
    } catch (error: any) {
      results.push({
        method: 'X-Tenant Header',
        success: false,
        error: error.response?.status,
        message: error.response?.data?.message
      });
    }
    
    // Method 3: Try with API key in different format
    try {
      const response3 = await axios.get(
        'https://api.commerce7.com/v1/customer?limit=1',
        {
          headers: {
            'Authorization': `Bearer ${C7_SECRET_KEY}`,
            'Tenant': C7_TENANT_ID,
            'Content-Type': 'application/json'
          }
        }
      );
      
      results.push({
        method: 'Bearer Token',
        success: true,
        customerCount: response3.data.customers?.length || 0
      });
    } catch (error: any) {
      results.push({
        method: 'Bearer Token',
        success: false,
        error: error.response?.status,
        message: error.response?.data?.message
      });
    }
    
    // Method 4: Try with API key as header
    try {
      const response4 = await axios.get(
        'https://api.commerce7.com/v1/customer?limit=1',
        {
          headers: {
            'X-API-Key': C7_SECRET_KEY,
            'Tenant': C7_TENANT_ID,
            'Content-Type': 'application/json'
          }
        }
      );
      
      results.push({
        method: 'X-API-Key Header',
        success: true,
        customerCount: response4.data.customers?.length || 0
      });
    } catch (error: any) {
      results.push({
        method: 'X-API-Key Header',
        success: false,
        error: error.response?.status,
        message: error.response?.data?.message
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Authentication test completed',
      credentials: {
        appId: C7_APP_ID,
        secretKeyLength: C7_SECRET_KEY.length,
        secretKeyPreview: C7_SECRET_KEY.substring(0, 10) + '...' + C7_SECRET_KEY.substring(C7_SECRET_KEY.length - 10),
        tenantId: C7_TENANT_ID
      },
      results
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: error.message
    }, { status: 500 });
  }
}
