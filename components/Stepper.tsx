"use client";

import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
  completedSteps: number[];
}

export default function Stepper({ steps, currentStep, onStepClick, completedSteps }: StepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex flex-col space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isClickable = isCompleted || index < currentStep;

          return (
            <div key={step.id} className="flex items-start">
              <div className="flex items-center">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 flex-shrink-0",
                    isCompleted
                      ? "bg-primary border-primary text-white"
                      : isCurrent
                      ? "bg-primary border-primary text-white"
                      : "bg-background border-muted-foreground text-muted-foreground",
                    isClickable && !isCurrent && !isCompleted && "hover:border-primary hover:text-primary cursor-pointer",
                    !isClickable && "cursor-not-allowed"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </button>
                <div className="ml-4">
                  <div className={cn(
                    "text-sm font-medium",
                    isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-0.5 h-8 ml-5 mt-2 transition-all duration-200",
                  isCompleted ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 