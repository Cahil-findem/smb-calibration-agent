import { useEffect } from 'react';
import './CandidateProfile.css';

interface Candidate {
  id: number;
  name: string;
  title: string;
  company: string;
  companyLogo: string;
  tenure: string;
  avatar: string;
  isTopMatch: boolean;
  matchCriteria: {
    role: boolean;
    location: boolean;
    experience: boolean;
    skills: boolean;
  };
  whyMatch: string;
  whyRich?: {
    text: string;
    highlights: Array<{
      phrase: string;
      category: string;
    }>;
  };
}

interface CandidateProfileProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  candidates?: Candidate[];
  currentIndex?: number;
  onNavigate?: (direction: 'up' | 'down') => void;
}

const CandidateProfile: React.FC<CandidateProfileProps> = ({
  isOpen,
  onClose,
  candidate,
  candidates = [],
  currentIndex = 0,
  onNavigate
}) => {
  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!candidate) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`profile-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Slideout Panel */}
      <div className={`candidate-profile-panel ${isOpen ? 'open' : ''}`}>
        {/* Header - MEG Style Navigation */}
        <div className="profile-header">
          <div className="profile-header-actions">
            <button
              className="nav-btn"
              onClick={() => onNavigate?.('up')}
              disabled={currentIndex === 0}
            >
              <span className="material-icons-round">keyboard_arrow_up</span>
            </button>
            <p className="nav-counter">
              {currentIndex + 1} of {candidates.length || 1}
            </p>
            <button
              className="nav-btn"
              onClick={() => onNavigate?.('down')}
              disabled={currentIndex >= (candidates.length - 1)}
            >
              <span className="material-icons-round">keyboard_arrow_down</span>
            </button>
          </div>
          <button className="profile-close-btn" onClick={onClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="profile-content">
          {/* Profile Header Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-avatar">
                {candidate.avatar.startsWith('http') ? (
                  <img src={candidate.avatar} alt={candidate.name} />
                ) : (
                  <span className="avatar-emoji">{candidate.avatar}</span>
                )}
              </div>
              <div className="profile-card-info">
                <h1 className="profile-card-name">{candidate.name}</h1>
                <div className="profile-card-job">
                  <span className="job-title-text">{candidate.title}</span>
                  <span className="job-at-text"> at </span>
                  <div className="company-info-inline">
                    <span className="company-logo-small">{candidate.companyLogo}</span>
                    <span className="company-name-text">{candidate.company}</span>
                    <span className="company-tenure-text">({candidate.tenure})</span>
                  </div>
                </div>
                <div className="profile-card-location">
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Work Experience Card */}
          <div className="profile-card">
            <div className="work-exp-header">
              <h2 className="work-exp-title">Work Experience</h2>
            </div>

            {/* Stats Row */}
            <div className="work-exp-stats">
              <div className="stat-card">
                <span className="stat-label">Avg. Tenure</span>
                <span className="stat-value">2.5 years</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Current Tenure</span>
                <span className="stat-value">2.2 years</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Experience</span>
                <span className="stat-value">14 years</span>
              </div>
            </div>

            {/* Experience Timeline */}
            <div className="experience-timeline">
              {/* Multi-role company - Google */}
              <div className="experience-entry">
                <div className="experience-left">
                  <div className="company-logo-timeline">
                    <span>🔷</span>
                  </div>
                  <div className="timeline-line"></div>
                </div>
                <div className="experience-content">
                  <div className="company-header">
                    <h3 className="company-name-link">Google</h3>
                    <span className="company-total-time">8 years</span>
                  </div>

                  <div className="role-entry">
                    <div className="role-title-row">
                      <span className="role-title">Principle Engineer</span>
                      <span className="role-at"> at </span>
                      <span className="role-company">Google</span>
                    </div>
                    <div className="role-period">
                      <span>Jan 2020 - Present (2 years)</span>
                      <span>San Francisco, CA</span>
                    </div>
                    <p className="role-description">
                      Built, designed, and shipped complex products on a global scale.
                    </p>
                  </div>

                  <div className="role-entry">
                    <div className="role-title-row">
                      <span className="role-title">Senior Engineer</span>
                      <span className="role-at"> at </span>
                      <span className="role-company">Google</span>
                    </div>
                    <div className="role-period">
                      <span>Jan 2018 - Jan 2020 (2 years)</span>
                      <span>San Francisco, CA</span>
                    </div>
                    <p className="role-description">
                      As a software engineer at Google, I collaborated on cutting-edge projects, refining my coding skills and problem-solving abilities within a dynamic team environment.
                    </p>
                  </div>

                  <div className="role-entry">
                    <div className="role-title-row">
                      <span className="role-title">Junior Engineer</span>
                      <span className="role-at"> at </span>
                      <span className="role-company">Google</span>
                    </div>
                    <div className="role-period">
                      <span>Jan 2014 - Jan 2018 (4 years)</span>
                      <span>San Francisco, CA</span>
                    </div>
                    <p className="role-description">
                      As a junior engineer, I enthusiastically immersed myself in diverse projects, eagerly absorbing knowledge and honing my technical skills.
                    </p>
                  </div>
                </div>
              </div>

              <div className="experience-divider"></div>

              {/* Single role - Beamery */}
              <div className="experience-entry">
                <div className="experience-left">
                  <div className="company-logo-timeline">
                    <span>🏢</span>
                  </div>
                </div>
                <div className="experience-content">
                  <div className="role-entry">
                    <div className="role-title-row">
                      <span className="role-title">Junior Engineer</span>
                      <span className="role-at"> at </span>
                      <span className="role-company">Beamery</span>
                    </div>
                    <div className="role-period">
                      <span>Jan 2012 - Jan 2014 (2 years)</span>
                      <span>San Francisco, CA</span>
                    </div>
                    <p className="role-description">
                      As a junior engineer, I enthusiastically immersed myself in diverse projects.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Education Card */}
          <div className="profile-card">
            <div className="education-header">
              <h2 className="education-title">Education</h2>
            </div>

            <div className="education-timeline">
              {/* PhD */}
              <div className="education-entry">
                <div className="education-icon">
                  <span>🎓</span>
                </div>
                <div className="education-content">
                  <div className="education-degree">
                    <span className="degree-text">PhD, Computer Science</span>
                    <span className="degree-at"> at </span>
                    <span className="school-text">Yale</span>
                  </div>
                  <div className="education-period">
                    Jan 2010 - Jan 2012 (2 years)
                  </div>
                </div>
              </div>

              <div className="education-divider"></div>

              {/* BA */}
              <div className="education-entry">
                <div className="education-icon">
                  <span>🎓</span>
                </div>
                <div className="education-content">
                  <div className="education-degree">
                    <span className="degree-text">BA, Computer Science</span>
                    <span className="degree-at"> at </span>
                    <span className="school-text">Berkeley</span>
                  </div>
                  <div className="education-period">
                    2006 - 2010 (4 years)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CandidateProfile;
