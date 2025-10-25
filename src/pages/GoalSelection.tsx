import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GoalSelection.css';

const GoalSelection: React.FC = () => {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJobDescription(value);

    // Store job description in localStorage
    const storedData = localStorage.getItem('demoSetupData');
    if (storedData) {
      try {
        const demoData = JSON.parse(storedData);
        demoData.jobDescription = value;
        localStorage.setItem('demoSetupData', JSON.stringify(demoData));
      } catch (error) {
        console.error('Error updating demo setup data:', error);
      }
    }
  };

  const handleContinue = async () => {
    if (jobDescription.trim() && !isProcessing) {
      setIsProcessing(true);

      try {
        // Call both APIs in parallel
        const [analysisResponse, questionsResponse] = await Promise.all([
          fetch('/api/analyze-job-description', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              role_brief: jobDescription,
              appended_feedback: '',
            }),
          }),
          fetch('/api/generate-screening-questions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jobDescription: jobDescription,
            }),
          }),
        ]);

        const analysisData = await analysisResponse.json();
        const questionsData = await questionsResponse.json();

        if (analysisData.success && questionsData.success) {
          // Store both responses in localStorage
          const storedData = localStorage.getItem('demoSetupData');
          if (storedData) {
            try {
              const demoData = JSON.parse(storedData);
              demoData.aiAnalysis = analysisData.response;
              demoData.screeningQuestions = questionsData.questions;
              localStorage.setItem('demoSetupData', JSON.stringify(demoData));
            } catch (error) {
              console.error('Error updating demo setup data:', error);
            }
          }

          // Navigate to next page
          setTransitionDirection('forward');
          setIsTransitioning(true);
          setTimeout(() => {
            navigate('/screening-questions');
          }, 600);
        } else {
          console.error('API Error:', analysisData.error || questionsData.error);
          alert('Error processing job description. Please try again.');
        }
      } catch (error) {
        console.error('Network Error:', error);
        alert('Network error. Please check your connection and try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleBack = () => {
    setTransitionDirection('backward');
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/onboarding');
    }, 600);
  };

  return (
    <div className="goal-selection-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: '60%' }}></div>
      </div>

      {/* Main Content */}
      <div className="goal-selection-content">
        <div className="content-inner">
          <div className={`title-section ${isTransitioning ? (transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down') : 'animate-fade-up'}`}>
            <div className="title-with-logo">
              <img
                className="x-logo"
                src="/AI Loader.gif"
                alt="Logo"
              />
              <h1 className="page-title">
                To get started, what role are we hiring for?
              </h1>
            </div>
          </div>

          <div className={`job-description-section ${isTransitioning ? (transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down') : 'animate-fade-up animate-delay-1'}`}>
            <textarea
              className="job-description-input"
              placeholder="Paste your job description here..."
              value={jobDescription}
              onChange={handleJobDescriptionChange}
              rows={12}
            />
          </div>

          <div className={`buttons-container ${isTransitioning ? (transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down') : 'animate-fade-up animate-delay-2'}`}>
            <div className="button-wrapper">
              <div
                className="btn btn-secondary"
                onClick={handleBack}
              >
                Back
              </div>
            </div>

            <div className="button-wrapper">
              <div
                className={`btn btn-blue ${!jobDescription.trim() || isProcessing ? 'disabled' : ''}`}
                onClick={handleContinue}
              >
                {isProcessing ? (
                  <span className="btn-processing">
                    <img src="/AI Loader.gif" alt="Processing" className="btn-loader" />
                    Processing...
                  </span>
                ) : (
                  'Continue'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalSelection;
