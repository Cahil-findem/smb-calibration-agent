import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OutreachContract.css';
import EmailGenerationLoader from '../components/EmailGenerationLoader';
import EmailHeader from '../components/EmailHeader';

interface ScreeningQuestion {
  id: number;
  question: string;
  intent: string;
}

const OutreachContract: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);

  useEffect(() => {
    // Load data from localStorage and generate email
    const storedData = localStorage.getItem('demoSetupData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        const jobDesc = data.jobDescription || '';
        const questions = data.screeningQuestions || [];

        setJobDescription(jobDesc);
        setScreeningQuestions(questions);

        // Generate outreach email
        if (jobDesc && questions.length > 0) {
          generateOutreachEmail(jobDesc, questions);
        } else {
          setIsLoadingEmail(false);
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        setIsLoadingEmail(false);
      }
    } else {
      setIsLoadingEmail(false);
    }
  }, []);

  const generateOutreachEmail = async (jobDesc: string, questions: ScreeningQuestion[]) => {
    try {
      setIsLoadingEmail(true);

      // Start both the API call and the 10-second timer
      const [data] = await Promise.all([
        fetch('/api/generate-outreach-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role_brief: jobDesc,
            screening_questions: questions,
          }),
        }).then(res => res.json()),
        new Promise(resolve => setTimeout(resolve, 10000)) // 10 seconds minimum
      ]);

      if (data.success) {
        setEmailSubject(data.subject || '');
        setEmailBody(data.emailBody);
      } else {
        console.error('Failed to generate email:', data.error);
      }
    } catch (error) {
      console.error('Error generating outreach email:', error);
    } finally {
      setIsLoadingEmail(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.main-content');
      if (scrollContainer) {
        setIsScrolled(scrollContainer.scrollTop > 0);
      }
    };

    const scrollContainer = document.querySelector('.main-content');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="outreach-contract">
      <div className="content-wrapper">
        {/* Sticky Header Container */}
        <div className={`sticky-header ${isScrolled ? 'scrolled' : ''}`}>
          {/* Header */}
          <div className="title-section">
            <div className="title-with-logo">
              <img
                className="x-logo"
                src="/AI%20Loader.gif"
                alt="AI Logo"
              />
              <h1 className="page-title">
                All set! Ready for me to start sourcing?
              </h1>
            </div>
            <div className="header-buttons">
              <button className="header-btn-secondary">
                Request Changes
              </button>
              <button className="header-btn-primary">
                Activate Sourcing
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="header-divider"></div>
        </div>

        {/* Two Column Layout */}
        <div className="two-column-layout">
          {/* Left Column - Candidate Preview */}
          <div className="left-column">
            <div className="email-preview-card">
              {/* Content */}
              <div className="email-content">
                {/* Email Section */}
                <div className="hero-section">
                  {/* Text Section */}
                  <div className="email-text-section">
                    {isLoadingEmail ? (
                      <EmailGenerationLoader />
                    ) : (
                      <>
                        <EmailHeader subject={emailSubject || "Default Subject Line"} />
                        <div
                          className="email-body-text"
                          dangerouslySetInnerHTML={{ __html: emailBody }}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contract Cards */}
          <div className="right-column">
            {/* Delivery */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">schedule</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Delivery</p>
                <p className="contract-description">
                  Receive <strong>3 interview-ready candidates</strong> within 2 weeks.
                </p>
              </div>
            </div>

            {/* Precision */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">gps_fixed</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Precision</p>
                <p className="contract-description">
                  I'll only reach out to candidates who meet your <strong>exact requirements</strong>.
                </p>
              </div>
            </div>

            {/* Continuous */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">refresh</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Continuous</p>
                <p className="contract-description">
                  Automatically discover and contact new talent as they <strong>enter the market</strong>.
                </p>
              </div>
            </div>

            {/* Automated Outreach */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">auto_awesome</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Automated Outreach</p>
                <p className="contract-description">
                  All candidate communication and screening are <strong>handled autonomously</strong>.
                </p>
              </div>
            </div>

            {/* Control */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">tune</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Control</p>
                <p className="contract-description">
                  Pause, adjust, or stop sourcing <strong>anytime</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutreachContract;
