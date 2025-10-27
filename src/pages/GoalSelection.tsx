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
      console.time('Total time to navigate');
      console.time('Screening questions API');

      try {
        // Start candidate analysis in the background (don't wait for it)
        console.log('Starting candidate analysis in background...');
        fetch('/api/analyze-job-description', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role_brief: jobDescription,
            appended_feedback: '',
          }),
        }).then(async (response) => {
          const analysisData = await response.json();
          if (analysisData.success) {
            // Store analysis results when ready
            const storedData = localStorage.getItem('demoSetupData');
            if (storedData) {
              try {
                const demoData = JSON.parse(storedData);
                demoData.aiAnalysis = analysisData.response;
                localStorage.setItem('demoSetupData', JSON.stringify(demoData));
                console.log('Candidate analysis completed and stored');
              } catch (error) {
                console.error('Error storing analysis data:', error);
              }
            }
          } else {
            console.error('Analysis API Error:', analysisData.error);
          }
        }).catch((error) => {
          console.error('Analysis Network Error:', error);
        });

        // Wait only for screening questions before navigating
        console.log('Fetching screening questions...');
        const questionsResponse = await fetch('/api/generate-screening-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobDescription: jobDescription,
          }),
        });
        console.timeEnd('Screening questions API');

        console.log('Parsing screening questions response...');
        const questionsData = await questionsResponse.json();
        console.log('Screening questions data:', questionsData);

        if (questionsData.success) {
          console.log('Storing screening questions...');
          // Store screening questions
          const storedData = localStorage.getItem('demoSetupData');
          if (storedData) {
            try {
              const demoData = JSON.parse(storedData);
              demoData.screeningQuestions = questionsData.questions;
              localStorage.setItem('demoSetupData', JSON.stringify(demoData));
            } catch (error) {
              console.error('Error updating demo setup data:', error);
            }
          }

          // Navigate to screening questions page
          console.log('Navigating to screening questions page...');
          console.timeEnd('Total time to navigate');
          setTransitionDirection('forward');
          setIsTransitioning(true);
          setTimeout(() => {
            navigate('/screening-questions');
          }, 600);
        } else {
          console.error('Questions API Error:', questionsData.error);
          alert('Error generating screening questions. Please try again.');
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
