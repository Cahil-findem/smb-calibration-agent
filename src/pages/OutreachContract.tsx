import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OutreachContract.css';

const OutreachContract: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

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
                {/* Hero Section */}
                <div className="hero-section">
                  <div className="hero-container">
                    <div className="hero-image-wrapper">
                      <img
                        src="/Email%20image.png"
                        alt="Hero"
                        className="hero-image"
                      />
                    </div>
                  </div>

                  {/* Text Section */}
                  <div className="email-text-section">
                    <h2 className="email-heading">
                      Your sourcing strategy is ready
                    </h2>
                    <div className="email-body-text">
                      <p>
                        I've calibrated on your ideal candidate profile based on the job description and your feedback.
                        I'll continuously source and evaluate candidates matching your criteria.
                      </p>
                      <p>
                        When I find strong matches, you'll receive notifications with detailed candidate profiles,
                        match explanations, and enriched work history to help you make quick decisions.
                      </p>
                    </div>
                  </div>

                  {/* CTA Section */}
                  <div className="cta-section">
                    <div className="cta-divider"></div>
                    <p className="cta-text">
                      Need to adjust the search criteria or candidate profile? You can refine anytime!
                    </p>
                    <button
                      className="cta-button"
                      onClick={() => navigate('/candidate-review')}
                    >
                      <span className="material-icons-round">tune</span>
                      <span>Refine Search</span>
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="email-footer">
                  <img src="/Kong_Footer_Logo.png" alt="Logo" className="footer-logo" />
                  <div className="footer-divider-line"></div>
                  <p className="footer-text">
                    Powered by AI-driven candidate sourcing and matching.
                  </p>
                  <div className="footer-copyright">
                    <p>© 2024 Findem Inc. All rights reserved.</p>
                    <p>Mountain View, California, USA</p>
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
                <span className="material-icons-round">auto_awesome</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Precision</p>
                <p className="contract-description">
                  Source candidates that closely match your <strong>exact requirements</strong> and ideal profile.
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
                  Automatically discover new candidates as they become available in the <strong>talent market</strong>.
                </p>
              </div>
            </div>

            {/* Quality */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">verified</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Quality</p>
                <p className="contract-description">
                  Every candidate includes <strong>enriched profiles</strong> with detailed work history and education.
                </p>
              </div>
            </div>

            {/* Insights */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">insights</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Insights</p>
                <p className="contract-description">
                  Get <strong>clear explanations</strong> of why each candidate matches your requirements.
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
                  Refine your search criteria <strong>anytime</strong> through conversational feedback.
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
