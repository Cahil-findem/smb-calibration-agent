import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './GoalSelection.css';

const GoalSelection: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if name is in URL parameter and save to localStorage
    const nameFromUrl = searchParams.get('name');
    if (nameFromUrl) {
      const storedData = localStorage.getItem('demoSetupData');
      if (storedData) {
        try {
          const demoData = JSON.parse(storedData);
          demoData.userName = nameFromUrl;
          localStorage.setItem('demoSetupData', JSON.stringify(demoData));
        } catch (error) {
          console.error('Error updating userName in localStorage:', error);
        }
      } else {
        // Create new entry if it doesn't exist
        const demoData = {
          userName: nameFromUrl,
          timestamp: Date.now()
        };
        localStorage.setItem('demoSetupData', JSON.stringify(demoData));
      }
    }
  }, [searchParams]);

  const exampleJobDescription = `What is Findem:

Findem is HR 2.0. We're a fast-growth startup with an ambitious vision and the technology to back it up. Our People Intelligence platform uses true AI and machine learning to provide critical solutions for talent acquisition and people analytics functions. With the deep insights that our platform provides, companies can build more engaged and diverse teams, and close their talent gaps faster. We have an amazing opportunity to establish ourselves as leaders in this space, and we need strong advocates to help us achieve that goal.

We're backed by top-tier investors including Wing Venture Capital – the same firm that backed Snowflake, Cohesity, and Gong. Findem powers businesses across scaling, pre-IPO, and publicly traded companies who trust us to solve their biggest HR and Talent challenges. We have an incredibly skilled and collaborative team that values curiosity, diversity, openness and building great experiences every day for our customers. By joining Findem, you will have the unique opportunity to help define what the future of HR looks like for every business.

Why We Need You:

We are looking for a seasoned Senior Staff Software Engineer to architect, lead, and drive strategic initiatives for robust, scalable backend infrastructure and microservices. You'll provide technical leadership and mentorship, while optimizing system performance, reliability, and scalability using tools like Docker, TypeScript, MongoDB, and generative AI technologies.
Your Working Experience:
BS/MS or higher in Computer Science or a closely related technical field.
Minimum 8-10 years of progressive experience in software engineering focused on backend and infrastructure.
Proven technical leadership experience driving large-scale microservices implementations.
Extensive experience optimizing backend systems performance, scalability, and reliability.
Significant track record implementing infrastructure solutions leveraging Docker, MongoDB, TypeScript, and generative AI.
Expert-level proficiency in designing and building infrastructure with TypeScript, MongoDB, Docker, and modern cloud technologies.
Extensive knowledge of microservices architecture, container orchestration, and RESTful API development.
Demonstrated expertise with performance engineering, reliability, scalability strategies, and generative AI.
Deep understanding of Agile methodologies, CI/CD pipelines, observability, and monitoring tools.
Outstanding leadership, problem-solving, and architectural decision-making capabilities.
Benefits & Perks:
Competitive base compensation
Equity grants that align your success with ours
Unlimited PTO
Generous healthcare coverage for you and your family
Home office and productivity setup stipend
Professional development budget and executive coaching access
$230,000 - $250,000 a year
We're an Equal Opportunity Employer

We believe that a diverse team builds better solutions. We're committed to creating an inclusive environment for all employees and welcome candidates from all backgrounds, experiences, and perspectives.`;

  const handleUseExample = () => {
    setJobDescription(exampleJobDescription);

    // Store in localStorage
    const storedData = localStorage.getItem('demoSetupData');
    if (storedData) {
      try {
        const demoData = JSON.parse(storedData);
        demoData.jobDescription = exampleJobDescription;
        localStorage.setItem('demoSetupData', JSON.stringify(demoData));
      } catch (error) {
        console.error('Error updating demo setup data:', error);
      }
    }
  };

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
        // Note: Candidate analysis will be started by RecipeLoader
        // We only wait for screening questions here before navigating

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
            // Preserve name parameter if it exists
            const nameParam = searchParams.get('name');
            if (nameParam) {
              navigate(`/screening-questions?name=${encodeURIComponent(nameParam)}`);
            } else {
              navigate('/screening-questions');
            }
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
      // Preserve name parameter if it exists
      const nameParam = searchParams.get('name');
      if (nameParam) {
        navigate(`/onboarding?name=${encodeURIComponent(nameParam)}`);
      } else {
        navigate('/onboarding');
      }
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
            <div className="textarea-header">
              <button className="use-example-btn" onClick={handleUseExample}>
                <span className="material-icons-round">auto_fix_high</span>
                Use example
              </button>
            </div>
            <textarea
              className="job-description-input"
              placeholder="Paste your job description here..."
              value={jobDescription}
              onChange={handleJobDescriptionChange}
              rows={12}
            />
          </div>

          {!isProcessing ? (
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
                  className={`btn btn-blue ${!jobDescription.trim() ? 'disabled' : ''}`}
                  onClick={handleContinue}
                >
                  Continue
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-chip-container">
              <div className="loading-chip">
                <img src="/AI Loader.gif" alt="Loading" className="loading-chip-spinner" />
                <span className="loading-chip-text">Generating screening questions</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalSelection;
