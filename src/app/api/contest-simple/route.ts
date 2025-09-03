import { NextResponse } from 'next/server';
import axios from 'axios';

// Commerce7 API Configuration
const C7_API_BASE = 'https://api.commerce7.com/v1';
const C7_APP_ID = process.env.C7_APP_ID;
const C7_SECRET_KEY = process.env.C7_SECRET_KEY;
const C7_TENANT_ID = process.env.C7_TENANT_ID;
const basicAuthToken = Buffer.from(`${C7_APP_ID}:${C7_SECRET_KEY}`).toString('base64');

const authConfig = {
  headers: {
    'Authorization': `Basic ${basicAuthToken}`,
    'Tenant': C7_TENANT_ID,
    'Content-Type': 'application/json',
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    console.log('Creating customer with data:', { firstName, lastName, email, phone });

    // Create customer data
    const customerData: any = {
      firstName,
      lastName,
      emails: [{ email }],
      countryCode: 'US',
      emailMarketingStatus: 'Subscribed'
    };
    
    if (phone) {
      // Format phone number with +1 prefix
      const formattedPhone = `+1${phone.replace(/\D/g, '')}`;
      customerData.phones = [{ phone: formattedPhone }];
    }

    console.log('Customer data to send:', customerData);
    console.log('Auth config:', {
      hasAuth: !!authConfig.headers.Authorization,
      hasTenant: !!authConfig.headers.Tenant,
      tenantId: C7_TENANT_ID
    });

    // Create customer in Commerce7
    const createResponse = await axios.post(
      `${C7_API_BASE}/customer`,
      customerData,
      authConfig
    );

    console.log('Customer created successfully:', createResponse.data);

    return NextResponse.json({
      success: true,
      message: "Customer created successfully!",
      customerId: createResponse.data.id,
      customer: createResponse.data
    });

  } catch (error: any) {
    console.error('Customer creation error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          ...error.config?.headers,
          Authorization: error.config?.headers?.Authorization ? 'Basic [REDACTED]' : 'Missing'
        }
      }
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to create customer',
        details: error.response?.data?.message || error.message,
        status: error.response?.status,
        debug: {
          hasAppId: !!C7_APP_ID,
          hasSecretKey: !!C7_SECRET_KEY,
          hasTenantId: !!C7_TENANT_ID,
          tenantId: C7_TENANT_ID
        }
      },
      { status: 500 }
    );
  }
}
