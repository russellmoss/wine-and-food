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
