import { NextResponse } from 'next/server';
import axios from 'axios';

// Commerce7 API Configuration
const C7_API_BASE = 'https://api.commerce7.com/v1';
const C7_APP_ID = process.env.C7_APP_ID;
const C7_SECRET_KEY = process.env.C7_SECRET_KEY;
const C7_TENANT_ID = process.env.C7_TENANT_ID;
const C7_TAG_ID = process.env.C7_TAG_ID;
const basicAuthToken = Buffer.from(`${C7_APP_ID}:${C7_SECRET_KEY}`).toString('base64');

const authConfig = {
  headers: {
    'Authorization': `Basic ${basicAuthToken}`,
    'Tenant': C7_TENANT_ID,
    'Content-Type': 'application/json',
  },
};

// Helper function to format phone numbers
function formatPhoneNumber(phone: string): string {
  let formattedPhone = phone.replace(/\D/g, "");
  if (formattedPhone.length === 10) {
    formattedPhone = `+1${formattedPhone}`;
  }
  return formattedPhone;
}

// Function to fetch customer by email
async function fetchCustomerByEmail(email: string) {
  try {
    const response = await axios.get(
      `${C7_API_BASE}/customer?q=${encodeURIComponent(email)}`,
      authConfig
    );
    return response.data.customers && response.data.customers.length > 0 
      ? response.data.customers[0] 
      : null;
  } catch (error: any) {
    console.error('Error fetching customer:', error.response?.data || error.message);
    return null;
  }
}

// Unified function to create or update customer with tag and email subscription
async function createOrUpdateCustomerWithTag(customerData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  metaData?: any;
}) {
  const { firstName, lastName, email, phone, metaData = {} } = customerData;
  const tagId = C7_TAG_ID;
  
  if (!tagId) {
    throw new Error('C7_TAG_ID environment variable is not set');
  }
  
  try {
    // Check if customer exists
    const existingCustomer = await fetchCustomerByEmail(email);
    
    if (existingCustomer) {
      // UPDATE existing customer
      const customerId = existingCustomer.id;
      
      // Preserve existing tags and add new one if not present
      const existingTags = existingCustomer.tags ? 
        existingCustomer.tags.map((tag: any) => ({ id: tag.id })) : [];
      
      // Check if tag already exists
      const hasTag = existingTags.some((tag: any) => tag.id === tagId);
      if (!hasTag) {
        existingTags.push({ id: tagId });
      }
      
      // Merge metadata
      const updatedMetaData = {
        ...existingCustomer.metaData,
        ...metaData
      };
      
      // Update customer
      const updatePayload: any = {
        firstName: firstName || existingCustomer.firstName,
        lastName: lastName || existingCustomer.lastName,
        emailMarketingStatus: "Subscribed",
        tags: existingTags,
        countryCode: 'US'
      };
      
      // Add phone if provided
      if (phone) {
        updatePayload.phones = [{ phone: formatPhoneNumber(phone) }];
      }
      
      // Add metadata only if it's valid (remove invalid keys)
      if (updatedMetaData && Object.keys(updatedMetaData).length > 0) {
        const validMetaData: any = {};
        // Only include valid metadata keys (avoid contest_entry_date, contest_prize)
        if (updatedMetaData.source) validMetaData.source = updatedMetaData.source;
        if (Object.keys(validMetaData).length > 0) {
          updatePayload.metaData = validMetaData;
        }
      }
      
      const response = await axios.put(
        `${C7_API_BASE}/customer/${customerId}`,
        updatePayload,
        authConfig
      );
      
      console.log('✅ Customer updated with tag:', customerId);
      return response.data;
      
    } else {
      // CREATE new customer
      const createPayload: any = {
        firstName,
        lastName,
        emails: [{ email }],
        emailMarketingStatus: "Subscribed",
        tags: [{ id: tagId }],
        countryCode: 'US'
      };
      
      // Add phone if provided
      if (phone) {
        createPayload.phones = [{ phone: formatPhoneNumber(phone) }];
      }
      
      // Add metadata only if it's valid (remove invalid keys)
      if (metaData && Object.keys(metaData).length > 0) {
        const validMetaData: any = {};
        // Only include valid metadata keys (avoid contest_entry_date, contest_prize)
        if (metaData.source) validMetaData.source = metaData.source;
        createPayload.metaData = validMetaData;
      }
      
      const response = await axios.post(
        `${C7_API_BASE}/customer`,
        createPayload,
        authConfig
      );
      
      console.log('✅ Customer created with tag:', response.data.id);
      return response.data;
    }
    
  } catch (error: any) {
    console.error('🚨 Error in createOrUpdateCustomerWithTag:', error.response?.data || error.message);
    throw error;
  }
}

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

    console.log('Creating/updating customer with data:', { firstName, lastName, email, phone });

    // Check if required environment variables are present
    if (!C7_APP_ID || !C7_SECRET_KEY || !C7_TENANT_ID || !C7_TAG_ID) {
      return NextResponse.json(
        { 
          error: 'Missing Commerce7 environment variables',
          debug: {
            hasAppId: !!C7_APP_ID,
            hasSecretKey: !!C7_SECRET_KEY,
            hasTenantId: !!C7_TENANT_ID,
            hasTagId: !!C7_TAG_ID,
            tenantId: C7_TENANT_ID
          }
        },
        { status: 500 }
      );
    }

    // Create or update customer with tag and email subscription
    const customerData = {
      firstName,
      lastName,
      email,
      phone,
      metaData: {
        source: 'wine-festival-contest-simple',
        contest_entry_date: new Date().toISOString(),
        contest_prize: 'Two Free Tastings ($50 value)'
      }
    };

    const customer = await createOrUpdateCustomerWithTag(customerData);

    console.log('✅ Customer processed successfully:', customer.id);

    return NextResponse.json({
      success: true,
      message: "Customer created/updated successfully!",
      customerId: customer.id,
      customer: customer,
      integrations: {
        commerce7: {
          success: true,
          customerId: customer.id,
          tagAttached: true,
          emailSubscribed: true
        }
      }
    });

  } catch (error: any) {
    console.error('🚨 Customer creation/update error:', {
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
        error: 'Failed to create/update customer',
        details: error.response?.data?.message || error.message,
        status: error.response?.status,
        debug: {
          hasAppId: !!C7_APP_ID,
          hasSecretKey: !!C7_SECRET_KEY,
          hasTenantId: !!C7_TENANT_ID,
          hasTagId: !!C7_TAG_ID,
          tenantId: C7_TENANT_ID
        }
      },
      { status: 500 }
    );
  }
}
