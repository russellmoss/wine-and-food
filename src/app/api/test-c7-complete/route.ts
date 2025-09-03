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
    const { testType = 'create', email, firstName, lastName, phone } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required for testing' },
        { status: 400 }
      );
    }

    // Check environment variables
    const envCheck = {
      hasAppId: !!C7_APP_ID,
      hasSecretKey: !!C7_SECRET_KEY,
      hasTenantId: !!C7_TENANT_ID,
      hasTagId: !!C7_TAG_ID,
      tenantId: C7_TENANT_ID,
      tagId: C7_TAG_ID
    };

    console.log('Environment check:', envCheck);

    if (!C7_APP_ID || !C7_SECRET_KEY || !C7_TENANT_ID || !C7_TAG_ID) {
      return NextResponse.json(
        { 
          error: 'Missing Commerce7 environment variables',
          envCheck
        },
        { status: 500 }
      );
    }

    const testResults = [];

    // Test 1: Check if customer exists
    try {
      const existingCustomer = await fetchCustomerByEmail(email);
      testResults.push({
        test: 'fetch_customer',
        success: true,
        result: existingCustomer ? 'Customer exists' : 'Customer does not exist',
        customerId: existingCustomer?.id
      });
    } catch (error: any) {
      testResults.push({
        test: 'fetch_customer',
        success: false,
        error: error.response?.data || error.message
      });
    }

    // Test 2: Create or update customer with tag
    try {
      const customerData = {
        firstName: firstName || 'Test',
        lastName: lastName || 'User',
        email,
        phone: phone || '5551234567',
        metaData: {
          source: 'comprehensive-test',
          test_type: testType,
          test_date: new Date().toISOString()
        }
      };

      const customer = await createOrUpdateCustomerWithTag(customerData);
      
      testResults.push({
        test: 'create_or_update_customer',
        success: true,
        result: 'Customer processed successfully',
        customerId: customer.id,
        customer: customer
      });

      // Test 3: Verify customer was created/updated correctly
      try {
        const verifyCustomer = await fetchCustomerByEmail(email);
        const hasTag = verifyCustomer?.tags?.some((tag: any) => tag.id === C7_TAG_ID);
        const isSubscribed = verifyCustomer?.emailMarketingStatus === 'Subscribed';
        
        testResults.push({
          test: 'verify_customer',
          success: true,
          result: 'Customer verification successful',
          hasTag,
          isSubscribed,
          emailMarketingStatus: verifyCustomer?.emailMarketingStatus,
          tags: verifyCustomer?.tags
        });
      } catch (error: any) {
        testResults.push({
          test: 'verify_customer',
          success: false,
          error: error.response?.data || error.message
        });
      }

    } catch (error: any) {
      testResults.push({
        test: 'create_or_update_customer',
        success: false,
        error: error.response?.data || error.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Comprehensive Commerce7 test completed',
      envCheck,
      testResults,
      summary: {
        totalTests: testResults.length,
        passedTests: testResults.filter(t => t.success).length,
        failedTests: testResults.filter(t => !t.success).length
      }
    });

  } catch (error: any) {
    console.error('🚨 Comprehensive test error:', error);
    
    return NextResponse.json(
      { 
        error: 'Comprehensive test failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Commerce7 Comprehensive Test Endpoint',
    usage: 'POST with { "email": "test@example.com", "testType": "create", "firstName": "Test", "lastName": "User", "phone": "5551234567" }',
    tests: [
      'fetch_customer - Check if customer exists by email',
      'create_or_update_customer - Create or update customer with tag and email subscription',
      'verify_customer - Verify customer was processed correctly'
    ]
  });
}
