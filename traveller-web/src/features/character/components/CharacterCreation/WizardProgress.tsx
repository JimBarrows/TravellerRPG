interface WizardStep {
  id: number;
  label: string;
  description: string;
}

interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void | Promise<void>;
}

const WizardProgress = ({ steps, currentStep, onStepClick }: WizardProgressProps) => {
  return (
    <div className="w-full">
      {/* Desktop Progress Bar */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isClickable = index <= currentStep + 1;
            
            return (
              <div
                key={step.id}
                className="flex-1 relative"
              >
                {/* Line connector */}
                {index > 0 && (
                  <div
                    className={`absolute left-0 top-5 w-full h-0.5 -translate-x-1/2 ${
                      isCompleted ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
                
                {/* Step indicator */}
                <div className="relative flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick?.(index)}
                    disabled={!isClickable}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      font-semibold z-10 transition-all
                      ${isActive 
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                        : isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                      }
                      ${isClickable ? 'cursor-pointer hover:ring-4 hover:ring-primary/20' : 'cursor-not-allowed'}
                    `}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </button>
                  
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 hidden lg:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Mobile Progress Indicator */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium">
            {steps[currentStep].label}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {steps[currentStep].description}
        </p>
      </div>
    </div>
  );
};

export default WizardProgress;