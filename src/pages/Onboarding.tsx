import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Onboarding.css';

interface DemoSetupData {
  userName: string;
  timestamp: number;
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    // Get user data from localStorage to personalize greeting
    const storedData = localStorage.getItem('demoSetupData');
    if (storedData) {
      try {
        const demoData: DemoSetupData = JSON.parse(storedData);
        setUserName(demoData.userName || 'there');
      } catch (error) {
        console.error('Error parsing demo setup data:', error);
        setUserName('there');
      }
    } else {
      setUserName('there');
    }
  }, []);

  const handleContinue = () => {
    if (currentStep === 1) {
      // Transition to step 2
      setTransitionDirection('forward');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(2);
        setIsTransitioning(false);
      }, 600); // Wait for fade-out animation
    } else {
      // Go to GoalSelection page
      navigate('/goal-selection');
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      // Transition back to step 1
      setTransitionDirection('backward');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(1);
        setIsTransitioning(false);
      }, 600); // Wait for fade-out animation
    }
  };

  const getStepContent = () => {
    if (currentStep === 1) {
      return {
        greeting: `Hey ${userName} 👋`,
        message: "I'm Sia, I'll be taking care of your search from end to end!"
      };
    } else {
      return {
        greeting: "Think of me as part of your team.",
        message: "I'll be reaching out to candidates around the clock and will bring you three interview-ready matches within two weeks."
      };
    }
  };

  const stepContent = getStepContent();

  const getAnimationClass = (baseDelay = '') => {
    if (isTransitioning) {
      return transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down';
    } else {
      return `animate-fade-up ${baseDelay}`;
    }
  };

  return (
    <div className="onboarding-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: currentStep === 1 ? '50%' : '100%' }}></div>
      </div>

      {/* Main Content */}
      <div className="onboarding-content">
        <div className="content-inner">
          <img
            className={`logo ${getAnimationClass()}`}
            src="/AI Loader.gif"
            alt="Loading animation"
          />

          <div className={`greeting-section ${getAnimationClass('animate-delay-1')}`}>
            <div className="greeting-header">
              <div className="greeting-title">
                {stepContent.greeting}
              </div>
            </div>
            <div className="greeting-body">
              <div className="welcome-message-container">
                <div className="welcome-message" dangerouslySetInnerHTML={{ __html: stepContent.message }} />
              </div>
            </div>
          </div>

          <div className={`buttons-container ${getAnimationClass('animate-delay-2')}`}>
            {currentStep === 2 && (
              <div className="button-wrapper">
                <div
                  className="btn btn-secondary"
                  onClick={handleBack}
                >
                  Back
                </div>
              </div>
            )}

            <div className="button-wrapper">
              <div
                className="btn btn-blue"
                onClick={handleContinue}
              >
                {currentStep === 2 ? 'Get started' : 'Continue'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
