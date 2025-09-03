'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface ContestFormProps {
  onSuccess?: () => void;
}

export default function ContestForm({ onSuccess }: ContestFormProps) {
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
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        } else {
          // Hide success message after 5 seconds (fallback for standalone use)
          setTimeout(() => {
            setSubmitStatus('idle');
          }, 5000);
        }
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
    <div className="min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
      <div className="w-full max-w-md mx-auto">
        {/* Logo - Centered above form */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <Image
            src="https://i.imgur.com/qfTW5j0.png"
            alt="Milea Estate Vineyard"
            width={160}
            height={60}
            className="block w-auto h-auto max-w-[140px] sm:max-w-[160px]"
            priority
          />
        </div>

        {/* Form Container */}
        <div className="form-container rounded-lg p-4 sm:p-8 md:p-10">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 sm:mb-4 text-festival-dark-brown font-playfair px-2">
            Step 2 - Enter your name and email for your chance to win
          </h1>
          <p className="text-center mb-6 sm:mb-8 text-festival-text text-xs sm:text-sm md:text-base font-montserrat font-light px-2 sm:px-4 leading-relaxed">
            Complete your entry to win two free tastings ($50 value) at Hudson Valley&apos;s Best Winery - Milea Estate Vineyard.
          </p>

          {submitStatus === 'success' && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-5 bg-green-100 text-green-700 rounded-lg text-center mx-1 sm:mx-2">
              <p className="font-bold text-sm sm:text-base">You&apos;re entered to win!</p>
              <p className="text-xs sm:text-sm mt-2">Check your email for confirmation.</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-5 bg-red-100 text-red-700 rounded-lg text-center mx-1 sm:mx-2">
              <p className="text-sm sm:text-base">{errorMessage}</p>
            </div>
          )}

          <form 
            onSubmit={handleSubmit} 
            className="" 
            autoComplete="on"
            noValidate
          >
            <div className="mb-6 sm:mb-8">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                autoComplete="given-name"
                id="firstName"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg focus:ring-2 focus:ring-festival-dark-brown text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <div className="mb-6 sm:mb-8">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                autoComplete="family-name"
                id="lastName"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg focus:ring-2 focus:ring-festival-dark-brown text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <div className="mb-6 sm:mb-8">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                autoComplete="email"
                id="email"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg focus:ring-2 focus:ring-festival-dark-brown text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <div className="mb-6 sm:mb-8">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number (Optional)"
                autoComplete="tel"
                id="phone"
                inputMode="tel"
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg focus:ring-2 focus:ring-festival-dark-brown text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary mt-2 min-h-[44px] text-sm sm:text-base"
            >
              {isSubmitting ? 'Entering...' : 'Enter Contest'}
            </button>
          </form>

          <p className="text-xs text-center mt-6 sm:mt-8 text-festival-light-brown font-montserrat font-light px-2 sm:px-4 leading-relaxed">
            By entering, you agree to receive marketing emails from Milea Estate Vineyard.
            You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
