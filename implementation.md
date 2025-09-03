# HV Wine & Food Festival Contest App - Step-by-Step Build Guide

## ⚠️ IMPORTANT SECURITY NOTE
**NEVER commit API keys to GitHub!** The keys you provided should only go in your `.env.local` file, which must be in `.gitignore`.

## Project Overview
A fast, mobile-optimized contest entry form for wine festival attendees that:
- Captures attendee information via QR code scan
- Creates Commerce7 customer profiles with event tag
- Adds contacts to Klaviyo with custom property
- Uses your winery's beige/brown color scheme with brand-aligned fonts

---

## Step 1: Initialize Next.js Project

**Cursor.ai Prompt:**
```
Initialize a new Next.js 13+ project with App Router, TypeScript, and Tailwind CSS in the current directory. Use npm as package manager.
```

**Terminal Commands:**
```bash
cd C:\Users\russe\HV-Wine-Fest
npx create-next-app@latest . --typescript --tailwind --app --use-npm
```

When prompted:
- Would you like to use ESLint? **Yes**
- Would you like to use `src/` directory? **No**
- Would you like to customize the default import alias? **No**

---

## Step 2: Create Environment Variables

**Cursor.ai Prompt:**
```
Create a .env.local file with the provided API keys and add .env.local to .gitignore
```

**Create `.env.local`:**
```env
# Commerce7 API Configuration
C7_APP_TITLE=Festival_app
C7_API_KEY=1nqWgR55RJUCHCRVo0CQRpfeO8OkiCx01qMkyefdCJ09LQxOPF3BplIWJHFEzH7s
C7_TENANT_ID=milea-estate-vineyard
C7_TAG_ID=bcef778b-9410-4c9d-9084-0bae9f46a89b

# Klaviyo API Configuration
KLAVIYO_API_KEY=pk_981243a27ef7e3955eafa7fe63169e58ed
KLAVIYO_LIST_ID=XCJKHQ

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Update `.gitignore`:**
```gitignore
# Environment variables
.env.local
.env
```

---

## Step 3: Install Dependencies

**Cursor.ai Prompt:**
```
Install axios for API calls and create package.json scripts for development
```

**Terminal Command:**
```bash
npm install axios
```

---

## Step 4: Create Custom Tailwind Configuration

**Cursor.ai Prompt:**
```
Update tailwind.config.ts to include custom colors for the wine festival theme and configure Playfair Display for headers (similar to Cochin) and Montserrat for body text (similar to Avenir)
```

**Update `tailwind.config.ts`:**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'festival-beige': '#D8D1AE',
        'festival-dark-brown': '#5A3E00',
        'festival-light-brown': '#B39E7E',
        'festival-form-bg': '#EFE8D4',
        'festival-input-bg': '#F9F4E9',
        'festival-text': '#715100',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

---

## Step 5: Update Global Styles

**Cursor.ai Prompt:**
```
Update app/globals.css with the wine festival theme styles, import Google Fonts (Playfair Display and Montserrat), and set up responsive design with proper font hierarchy
```

**Update `app/globals.css`:**
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  background-color: #D8D1AE;
  color: #715100;
}

h1, h2, h3 {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
}

.form-container {
  background-color: #EFE8D4;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background-color: #5A3E00;
  color: white;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  cursor: pointer;
  font-size: 16px;
  font-family: 'Montserrat', sans-serif;
}

.btn-primary:hover {
  background-color: #3D2900;
}

.btn-primary:disabled {
  background-color: #B39E7E;
  cursor: not-allowed;
}

input {
  background-color: #F9F4E9;
  border: 1px solid #715100;
  color: #715100;
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
}

input::placeholder {
  color: #B39E7E;
  font-weight: 300;
}

input:focus {
  outline: none;
  border-color: #5A3E00;
  box-shadow: 0 0 0 2px rgba(90, 62, 0, 0.1);
}

/* Mobile-specific styles */
@media (max-width: 640px) {
  input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
```

---

## Step 6: Create API Route for Contest Entry

**Cursor.ai Prompt:**
```
Create an API route at app/api/contest/route.ts that handles form submission with optional phone number, creates Commerce7 customer with tag, and adds to Klaviyo list XCJKHQ with custom property 2025_wine_and_food_fest
```

**Create `app/api/contest/route.ts`:**
```typescript
import { NextResponse } from 'next/server';
import axios from 'axios';

// Commerce7 API Configuration
const C7_API_BASE = 'https://api.commerce7.com/v1';
const C7_AUTH = Buffer.from(`${process.env.C7_APP_TITLE}:${process.env.C7_API_KEY}`).toString('base64');

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

    // Step 1: Check if customer exists in Commerce7
    const searchResponse = await axios.get(`${C7_API_BASE}/customer`, {
      params: { q: email },
      headers: {
        'Authorization': `Basic ${C7_AUTH}`,
        'Content-Type': 'application/json',
        'Tenant': process.env.C7_TENANT_ID,
      },
    });

    let customerId: string;
    const existingCustomer = searchResponse.data.customers?.[0];

    if (existingCustomer) {
      // Customer exists - update with tag and phone if provided
      customerId = existingCustomer.id;
      
      const existingTags = existingCustomer.tags || [];
      const tagId = process.env.C7_TAG_ID;
      
      // Check if tag already exists
      const hasTag = existingTags.some((tag: any) => tag.id === tagId);
      
      const updateData: any = {
        tags: hasTag ? existingTags.map((tag: any) => ({ id: tag.id })) : [...existingTags.map((tag: any) => ({ id: tag.id })), { id: tagId }]
      };
      
      // Add phone if provided and not already present
      if (phone && (!existingCustomer.phones || existingCustomer.phones.length === 0)) {
        updateData.phones = [{ phone }];
      }
      
      await axios.put(
        `${C7_API_BASE}/customer/${customerId}`,
        updateData,
        {
          headers: {
            'Authorization': `Basic ${C7_AUTH}`,
            'Content-Type': 'application/json',
            'Tenant': process.env.C7_TENANT_ID,
          },
        }
      );
    } else {
      // Create new customer with tag
      const createData: any = {
        firstName,
        lastName,
        emails: [{ email }],
        tags: [{ id: process.env.C7_TAG_ID }],
        countryCode: 'US',
        emailMarketingStatus: 'Subscribed'
      };
      
      if (phone) {
        createData.phones = [{ phone }];
      }
      
      const createResponse = await axios.post(
        `${C7_API_BASE}/customer`,
        createData,
        {
          headers: {
            'Authorization': `Basic ${C7_AUTH}`,
            'Content-Type': 'application/json',
            'Tenant': process.env.C7_TENANT_ID,
          },
        }
      );
      customerId = createResponse.data.id;
    }

    // Step 2: Add to Klaviyo with custom property
    const klaviyoData = {
      profiles: [
        {
          email: email,
          first_name: firstName,
          last_name: lastName,
          phone_number: phone || undefined,
          properties: {
            '2025_wine_and_food_fest': true,
            'contest_entry_date': new Date().toISOString(),
            'contest_prize': 'Two Free Tastings ($50 value)'
          }
        }
      ]
    };

    await axios.post(
      `https://a.klaviyo.com/api/v2/list/${process.env.KLAVIYO_LIST_ID}/members`,
      klaviyoData,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        params: {
          api_key: process.env.KLAVIYO_API_KEY
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: "You're entered to win!",
      customerId
    });

  } catch (error: any) {
    console.error('Contest entry error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { error: 'Failed to process entry. Please try again.' },
      { status: 500 }
    );
  }
}
```

---

## Step 7: Create Contest Entry Form Component

**Cursor.ai Prompt:**
```
Create a responsive contest entry form component with proper form validation, loading states, success messaging, autofill optimization, and optional phone field
```

**Create `app/components/ContestForm.tsx`:**
```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export default function ContestForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
        });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 5000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="https://i.imgur.com/qfTW5j0.png"
            alt="Milea Estate Vineyard"
            width={160}
            height={60}
            className="mx-auto"
            priority
          />
        </div>

        {/* Form Container */}
        <div className="form-container rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2 text-festival-dark-brown font-playfair">
            2025 HV Food & Wine Fest Giveaway
          </h1>
          <p className="text-center mb-6 text-festival-text text-sm font-montserrat font-light">
            Enter to win two free tastings ($50 value) at Hudson Valley&apos;s Best Winery - Milea Estate Vineyard.
          </p>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg text-center">
              <p className="font-bold">You&apos;re entered to win!</p>
              <p className="text-sm mt-1">Check your email for confirmation.</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
              <p>{errorMessage}</p>
            </div>
          )}

          <form 
            onSubmit={handleSubmit} 
            className="space-y-4" 
            autoComplete="on"
            noValidate
          >
            <div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                autoComplete="given-name"
                className="w-full px-4 py-3 rounded-md focus:ring-2 focus:ring-festival-dark-brown"
              />
            </div>

            <div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                autoComplete="family-name"
                className="w-full px-4 py-3 rounded-md focus:ring-2 focus:ring-festival-dark-brown"
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-md focus:ring-2 focus:ring-festival-dark-brown"
              />
            </div>

            <div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number (Optional)"
                autoComplete="tel"
                inputMode="tel"
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                className="w-full px-4 py-3 rounded-md focus:ring-2 focus:ring-festival-dark-brown"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary"
            >
              {isSubmitting ? 'Entering...' : 'Enter Contest'}
            </button>
          </form>

          <p className="text-xs text-center mt-6 text-festival-light-brown font-montserrat font-light">
            By entering, you agree to receive marketing emails from Milea Estate Vineyard.
            You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 8: Update Main Page

**Cursor.ai Prompt:**
```
Update the main app/page.tsx to use the ContestForm component and set proper metadata
```

**Update `app/page.tsx`:**
```tsx
import ContestForm from './components/ContestForm';

export const metadata = {
  title: '2025 HV Food & Wine Fest Giveaway - Milea Estate Vineyard',
  description: 'Enter to win two free tastings ($50 value) at Hudson Valley Wine & Food Festival',
  icons: {
    icon: 'https://i.imgur.com/qfTW5j0.png',
  },
};

export default function Home() {
  return <ContestForm />;
}
```

---

## Step 9: Update Layout with Mobile Optimization

**Cursor.ai Prompt:**
```
Update app/layout.tsx with proper viewport settings and metadata for mobile devices
```

**Update `app/layout.tsx`:**
```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '2025 HV Food & Wine Fest Giveaway',
  description: 'Enter to win two free tastings at Milea Estate Vineyard',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#D8D1AE',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

---

## Step 10: Create Vercel Configuration

**Cursor.ai Prompt:**
```
Create vercel.json configuration file for optimal performance
```

**Create `vercel.json`:**
```json
{
  "functions": {
    "app/api/contest/route.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## Step 11: Test Locally

**Terminal Commands:**
```bash
npm run dev
```

Visit `http://localhost:3000` and test the form submission.

---

## Step 12: Deploy to Vercel

**Cursor.ai Prompt:**
```
Create instructions for deploying this Next.js app to Vercel with environment variables
```

**Deployment Steps:**

1. **Initialize Git:**
```bash
git init
git add .
git commit -m "Initial commit - HV Wine Fest Contest App"
```

2. **Push to GitHub:**
```bash
git remote add origin https://github.com/YOUR-USERNAME/hv-wine-fest.git
git branch -M main
git push -u origin main
```

3. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     ```
     C7_APP_TITLE=Festival_app
     C7_API_KEY=1nqWgR55RJUCHCRVo0CQRpfeO8OkiCx01qMkyefdCJ09LQxOPF3BplIWJHFEzH7s
     C7_TENANT_ID=milea-estate-vineyard
     C7_TAG_ID=bcef778b-9410-4c9d-9084-0bae9f46a89b
     KLAVIYO_API_KEY=pk_981243a27ef7e3955eafa7fe63169e58ed
     KLAVIYO_LIST_ID=XCJKHQ
     ```
   - Click "Deploy"

---

## Step 13: Generate QR Code

Once deployed, create a QR code for your Vercel URL:
- Visit [qr-code-generator.com](https://www.qr-code-generator.com/)
- Enter your Vercel URL (e.g., `https://hv-wine-fest.vercel.app`)
- Download and print for the festival

---

## Testing Checklist

- [ ] Form submits successfully
- [ ] Commerce7 customer created with tag
- [ ] Klaviyo contact added with custom property
- [ ] Mobile responsive design
- [ ] Fast loading time
- [ ] Success/error messages display correctly
- [ ] Form clears after submission
- [ ] Autofill working on mobile devices
- [ ] Phone field (optional) working correctly
- [ ] Fonts display correctly (Playfair Display and Montserrat)

---

## Testing Autofill

To test if autofill is working:

**On iPhone:**
1. Go to Settings > Safari > AutoFill
2. Ensure "Contact Info" is turned on
3. Visit your form and tap a field - you should see your info appear above the keyboard

**On Android:**
1. Chrome automatically suggests from your Google account
2. Tap the field and look for autofill suggestions above the keyboard

**Desktop Chrome:**
1. Chrome > Settings > Autofill
2. Add a test address/contact
3. Click on form fields to see suggestions

---

## Troubleshooting

**Issue: API calls failing**
- Check environment variables are set correctly in Vercel
- Verify API keys are active
- Check Commerce7 tag ID exists

**Issue: Klaviyo not receiving contacts**
- Ensure KLAVIYO_LIST_ID is set to XCJKHQ
- Verify API key has list write permissions
- Check Klaviyo API response in Vercel logs

**Issue: Slow form submission**
- Normal processing time: 2-4 seconds
- Check Vercel function logs for errors
- Consider implementing optimistic UI updates

**Issue: Autofill not working**
- Ensure correct `autocomplete` attributes are present
- Check that input `type` attributes are correct
- Verify form has proper `name` attributes

---

## Production Considerations

1. **Add Google Analytics** for tracking conversions
2. **Implement rate limiting** to prevent spam
3. **Add honeypot field** for bot protection
4. **Create success page** with social sharing options
5. **Set up Klaviyo flow** triggered by `2025_wine_and_food_fest` property
6. **Test on various devices** at the festival location
7. **Have offline fallback** in case of poor cell service
8. **Monitor Vercel analytics** during the event

This completes your Hudson Valley Wine & Food Fest contest app! 🍷🎉