"use client";

import { Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useForm } from "react-hook-form";
import type { AccountInfoFormValues } from "./AccountInfoForm";
import type { ContactInfoFormValues } from "./ContactInfoForm";

interface ProfileCompletionCardProps {
  accountInfoForm: ReturnType<typeof useForm<AccountInfoFormValues>>;
  contactInfoForm: ReturnType<typeof useForm<ContactInfoFormValues>>;
}

export function ProfileCompletionCard({ 
  accountInfoForm, 
  contactInfoForm 
}: ProfileCompletionCardProps) {
  const { user } = useAuth();

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const values = accountInfoForm.getValues();
    const contactValues = contactInfoForm.getValues();
    
    let completed = 0;
    const total = 5; // Total number of profile sections
    
    // Setup account (always completed if user exists)
    if (user) completed += 1;
    
    // Upload photo
    if (user?.avatar || user?.avatar_thumb) completed += 1;
    
    // Personal info
    if (values.name && values.company && values.position) completed += 1;
    
    // Biography
    if (values.bio) completed += 1;
    
    // Contact info
    if (contactValues.contactInfos.some(info => info.title && info.value)) completed += 1;
    
    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Check completion status for each task
  const isAccountSetup = !!user;
  const isPhotoUploaded = !!(user?.avatar || user?.avatar_thumb);
  const isPersonalInfoComplete = !!(accountInfoForm.watch('name') && accountInfoForm.watch('company') && accountInfoForm.watch('position'));
  const isBiographyComplete = !!accountInfoForm.watch('bio');
  const isContactInfoComplete = contactInfoForm.watch('contactInfos').some(info => info.title && info.value);

  return (

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h3 className="text-lg font-semibold">Complete Profile</h3>
            <p className="text-sm text-muted-foreground">Lorem ipsum dolor</p>
          </div>
          
          {/* Circular Progress */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - profileCompletion / 100)}`}
                  className="text-orange-500 transition-all duration-300"
                />
              </svg>
              {/* Percentage text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-semibold">{profileCompletion}%</span>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${
                  isAccountSetup 
                    ? 'bg-orange-500' 
                    : 'border border-gray-300 bg-white'
                }`}>
                  {isAccountSetup && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm ${isAccountSetup ? 'text-gray-900' : 'text-gray-500'}`}>
                  Setup account
                </span>
              </div>
              <span className="text-xs text-gray-400">+10%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${
                  isPhotoUploaded 
                    ? 'bg-orange-500' 
                    : 'border border-gray-300 bg-white'
                }`}>
                  {isPhotoUploaded && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm ${isPhotoUploaded ? 'text-gray-900' : 'text-gray-500'}`}>
                  Upload Your photo
                </span>
              </div>
              <span className="text-xs text-gray-400">+10%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${
                  isPersonalInfoComplete 
                    ? 'bg-orange-500' 
                    : 'border border-gray-300 bg-white'
                }`}>
                  {isPersonalInfoComplete && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm ${isPersonalInfoComplete ? 'text-gray-900' : 'text-gray-500'}`}>
                  Personal Info
                </span>
              </div>
              <span className="text-xs text-gray-400">+10%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${
                  isBiographyComplete 
                    ? 'bg-orange-500' 
                    : 'border border-gray-300 bg-white'
                }`}>
                  {isBiographyComplete && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm ${isBiographyComplete ? 'text-gray-900' : 'text-gray-500'}`}>
                  Biography
                </span>
              </div>
              <span className="text-xs text-gray-400">+10%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${
                  isContactInfoComplete 
                    ? 'bg-orange-500' 
                    : 'border border-gray-300 bg-white'
                }`}>
                  {isContactInfoComplete && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm ${isContactInfoComplete ? 'text-gray-900' : 'text-gray-500'}`}>
                  Express Ready
                </span>
              </div>
              <span className="text-xs text-gray-400">+10%</span>
            </div>
          </div>
        </div>

  );
}
