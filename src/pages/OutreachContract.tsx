import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OutreachContract.css';
import EmailGenerationLoader from '../components/EmailGenerationLoader';
import EmailHeader from '../components/EmailHeader';
import ChatPane from '../components/ChatPane';

interface ScreeningQuestion {
  id: number;
  question: string;
  intent: string;
}

const OutreachContract: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleActivateSourcing = () => {
    navigate('/success');
  };

  const handleRequestChanges = () => {
    setIsChatOpen(true);
  };

  useEffect(() => {
    // Load data from localStorage and generate email
    const storedData = localStorage.getItem('demoSetupData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        const jobDesc = data.jobDescription || '';
        const questions = data.screeningQuestions || [];

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

      // Use Vercel API endpoint in production, localhost in development
      const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3004/api/generate-outreach-email'
        : '/api/generate-outreach-email';

      // Start the API call
      const apiPromise = fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role_brief: jobDesc,
          screening_questions: questions,
        }),
      }).then(res => res.json());

      // Start the minimum 10-second timer
      const timerPromise = new Promise(resolve => setTimeout(resolve, 10000));

      // Wait for the API response (but don't block on timer yet)
      const data = await apiPromise;

      // Update the email content as soon as API returns
      if (data.success) {
        setEmailSubject(data.subject || '');
        setEmailBody(data.emailBody);
        console.log('Email content updated:', data.subject);
      } else {
        console.error('Failed to generate email:', data.error);
      }

      // Now wait for the remaining time on the timer
      await timerPromise;

    } catch (error) {
      console.error('Error generating outreach email:', error);
      // Still wait for minimum time even on error
      await new Promise(resolve => setTimeout(resolve, 10000));
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
    <div className={`outreach-contract ${isChatOpen ? 'chat-open' : ''}`}>
      <div className={`content-wrapper ${isChatOpen ? 'chat-open' : ''}`}>
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
              <button className="header-btn-secondary" onClick={handleRequestChanges}>
                Request Changes
              </button>
              <button className="header-btn-primary" onClick={handleActivateSourcing}>
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
            {/* Precision */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">gps_fixed</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Precision</p>
                <p className="contract-description">
                  I only reach out to candidates who match your <strong>exact requirements</strong>.
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

            {/* Continuous */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">refresh</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Continuous</p>
                <p className="contract-description">
                  Automatically find and contact new talent as they <strong>enter the market</strong>.
                </p>
              </div>
            </div>

            {/* Delivery */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">check_circle</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Delivery</p>
                <p className="contract-description">
                  Receive <strong>3 interview-ready candidates</strong> within 2 weeks.
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

      {/* Chat Pane for Request Changes */}
      <ChatPane
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        title="Chat with Sia"
        mode="outreach"
        emailSubject={emailSubject}
        emailBody={emailBody}
      />
    </div>
  );
};

export default OutreachContract;
