'use client';

import { useState } from 'react';
import Image from 'next/image';
import ContestForm from './ContestForm';

type Step = 'instagram' | 'form' | 'success';

export default function ContestFlow() {
  const [currentStep, setCurrentStep] = useState<Step>('instagram');

  const handleInstagramFollow = () => {
    // Open Instagram in new tab/window
    window.open('https://www.instagram.com/mileaestatewinery/', '_blank');
    
    // Transition to form step after a short delay
    setTimeout(() => {
      setCurrentStep('form');
    }, 1000);
  };

  const handleFormSuccess = () => {
    setCurrentStep('success');
    
    // Redirect to Milea website after 3 seconds
    setTimeout(() => {
      window.location.href = 'https://mileaestatevineyard.com/';
    }, 3000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'instagram':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
            <div className="w-full max-w-md mx-auto">
              {/* Logo - Centered */}
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

                             {/* Prize Box */}
               <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 shadow-md">
                 <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-festival-dark-brown font-playfair leading-relaxed px-2">
                   Enter To Win a Free Tasting For Two ($50 value)
                 </h1>
               </div>

               {/* Entry is Easy */}
               <div className="text-center mb-4 sm:mb-6">
                 <h2 className="text-lg sm:text-xl font-semibold text-festival-dark-brown font-montserrat">
                   Entry is Easy
                 </h2>
               </div>

               {/* Steps Overview Box */}
               <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 shadow-md">
                 <div className="text-center">
                   <h3 className="text-base sm:text-lg font-semibold text-festival-dark-brown font-montserrat mb-3 sm:mb-4">
                     Step 1 - Follow us on Instagram
                   </h3>
                   <h3 className="text-base sm:text-lg font-semibold text-festival-dark-brown font-montserrat">
                     Step 2 - Submit your name and email
                   </h3>
                 </div>
               </div>

               {/* Step 1 Action Box */}
               <div className="form-container rounded-lg p-4 sm:p-8 md:p-10">
                 <div className="text-center mb-4 sm:mb-6">
                   <h2 className="text-base sm:text-lg font-semibold text-festival-dark-brown font-montserrat mb-4 sm:mb-6">
                     Step 1 - Follow us on Instagram
                   </h2>
                   
                   <button
                     onClick={handleInstagramFollow}
                     className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 sm:py-5 px-6 sm:px-10 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base min-h-[44px]"
                   >
                     <svg 
                       className="w-6 h-6" 
                       fill="currentColor" 
                       viewBox="0 0 24 24"
                     >
                       <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                     </svg>
                     Follow Us
                   </button>
                 </div>
               </div>

               {/* Instructions */}
               <div className="text-center mt-4 sm:mt-6">
                 <p className="text-festival-text text-xs sm:text-sm font-montserrat font-light px-2 sm:px-4 leading-relaxed">
                   Come back to this page after you have followed us in order to complete the process
                 </p>
               </div>
            </div>
          </div>
        );

      case 'form':
        return <ContestForm onSuccess={handleFormSuccess} />;

      case 'success':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
            <div className="w-full max-w-md mx-auto">
              {/* Logo - Centered */}
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

              {/* Success Content */}
              <div className="form-container rounded-lg p-4 sm:p-8 md:p-10">
                <div className="text-center">
                  <div className="mb-4 sm:mb-6">
                    <svg 
                      className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                  
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 sm:mb-4 text-festival-dark-brown font-playfair px-2">
                    You're Entered!
                  </h1>
                  
                  <p className="text-center mb-4 sm:mb-6 text-festival-text text-xs sm:text-sm md:text-base font-montserrat font-light px-2 sm:px-4 leading-relaxed">
                    Thank you for entering our contest! Check your email for confirmation.
                  </p>
                  
                  <p className="text-center text-festival-light-brown text-xs sm:text-sm font-montserrat font-light px-2 sm:px-4">
                    Redirecting to Milea Estate Vineyard...
                  </p>
                  
                  <div className="mt-4 sm:mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-festival-dark-brown h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderStep();
}
