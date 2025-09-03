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

    // Debug: Log environment variables (without exposing sensitive data)
    console.log('Environment check:', {
      hasAppId: !!process.env.C7_APP_ID,
      hasSecretKey: !!process.env.C7_SECRET_KEY,
      hasTenantId: !!process.env.C7_TENANT_ID,
      hasTagId: !!process.env.C7_TAG_ID,
      tenantId: process.env.C7_TENANT_ID,
    });

    // Check if required environment variables are present
    if (!C7_APP_ID || !C7_SECRET_KEY || !C7_TENANT_ID) {
      console.log('Missing Commerce7 environment variables, skipping Commerce7 integration');
    }

    // Step 1: Check if customer exists in Commerce7 (only if credentials are available)
    let existingCustomer = null;
    let customerId = null;
    
    if (C7_APP_ID && C7_SECRET_KEY && C7_TENANT_ID) {
      console.log('Making Commerce7 API request to:', `${C7_API_BASE}/customer`);
      console.log('Using authConfig:', authConfig);
      
      try {
        const searchResponse = await axios.get(`${C7_API_BASE}/customer`, {
          params: { q: email },
          ...authConfig,
        });
        
        existingCustomer = searchResponse.data.customers?.[0];
        if (existingCustomer) {
          customerId = existingCustomer.id;
          console.log('Found existing customer:', customerId);
        }
      } catch (searchError: any) {
        console.log('Customer search failed, will create new customer:', searchError.response?.status);
        // If search fails, we'll just create a new customer
      }

      if (existingCustomer) {
        // Customer exists - update with phone if provided
        const updateData: any = {};
        
        // Add phone if provided and not already present
        if (phone && (!existingCustomer.phones || existingCustomer.phones.length === 0)) {
          // Format phone number with +1 prefix like the working system
          const formattedPhone = `+1${phone.replace(/\D/g, '')}`;
          updateData.phones = [{ phone: formattedPhone }];
        }
        
        if (Object.keys(updateData).length > 0) {
          try {
            await axios.put(
              `${C7_API_BASE}/customer/${customerId}`,
              updateData,
              authConfig
            );
            console.log('Updated existing customer');
          } catch (updateError: any) {
            console.log('Customer update failed:', updateError.response?.status);
          }
        }
      } else {
        // Create new customer
        const createData: any = {
          firstName,
          lastName,
          emails: [{ email }],
          countryCode: 'US',
          emailMarketingStatus: 'Subscribed'
        };
        
        if (phone) {
          // Format phone number with +1 prefix like the working system
          const formattedPhone = `+1${phone.replace(/\D/g, '')}`;
          createData.phones = [{ phone: formattedPhone }];
        }
        
        try {
          const createResponse = await axios.post(
            `${C7_API_BASE}/customer`,
            createData,
            authConfig
          );
          customerId = createResponse.data.id;
          console.log('Created new customer:', customerId);
        } catch (createError: any) {
          console.log('Customer creation failed:', createError.response?.status, createError.response?.data);
          // Continue with Klaviyo even if Commerce7 fails
          customerId = 'failed-to-create';
        }
      }
    } else {
      console.log('Skipping Commerce7 integration due to missing credentials');
      customerId = 'skipped-no-credentials';
    }

    // Step 2: Add to Klaviyo with custom property (using new API)
    let klaviyoSuccess = false;
    if (process.env.KLAVIYO_API_KEY && process.env.KLAVIYO_LIST_ID) {
      try {
      const klaviyoData = {
        data: [{
          type: 'profile',
          attributes: {
            email: email,
            first_name: firstName,
            last_name: lastName,
            // Only include phone_number if it's a valid format to avoid SMS validation errors
            ...(phone && phone.replace(/\D/g, '').length >= 10 ? {
              phone_number: `+1${phone.replace(/\D/g, '')}`
            } : {}),
            properties: {
              '2025_wine_and_food_fest': true,
              'contest_entry_date': new Date().toISOString(),
              'contest_prize': 'Two Free Tastings ($50 value)'
            }
          }
        }]
      };

      await axios.post(
        'https://a.klaviyo.com/api/profiles/',
        klaviyoData,
        {
          headers: {
            'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'revision': '2024-10-15'
          }
        }
      );

      // Skip list addition for now - just creating the profile is sufficient
      // The profile will be created with the contest properties
      console.log('Profile created successfully, skipping list addition');

        console.log('Successfully added to Klaviyo');
        klaviyoSuccess = true;
      } catch (klaviyoError: any) {
        console.log('Klaviyo integration failed:', klaviyoError.response?.status, klaviyoError.response?.data);
        // Continue even if Klaviyo fails
      }
    } else {
      console.log('Skipping Klaviyo integration due to missing credentials');
    }

    return NextResponse.json({
      success: true,
      message: "You're entered to win!",
      customerId,
      integrations: {
        commerce7: customerId && customerId !== 'skipped-no-credentials' && customerId !== 'failed-to-create',
        klaviyo: klaviyoSuccess
      }
    });

  } catch (error: any) {
    // Format Commerce7 errors like the working system
    const formatCommerce7Errors = (error: any) => {
      if (!error.response?.data?.errors) {
        return error.message;
      }

      const errors = error.response.data.errors;
      const errorMessages = errors.map((err: any) => {
        const field = err.field || 'unknown field';
        const message = err.message || 'Invalid value';
        return `${field}: ${message}`;
      });

      return `Commerce7 Validation Errors:\n${errorMessages.join('\n')}`;
    };

    console.error('Contest entry error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      }
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to process entry. Please try again.',
        details: error.response?.data?.message || formatCommerce7Errors(error) || error.message 
      },
      { status: 500 }
    );
  }
}
