import { useEffect } from 'react';
import './CandidateProfile.css';
import { getEmoji } from '../utils/emojiConverter';

// Available company logos
const companyLogos = [
  '/logos/logoipsum-357.svg',
  '/logos/logoipsum-359.svg',
  '/logos/logoipsum-365.svg',
  '/logos/logoipsum-368.svg',
  '/logos/logoipsum-370.svg',
  '/logos/logoipsum-374.svg',
  '/logos/logoipsum-376.svg',
  '/logos/logoipsum-381.svg',
  '/logos/logoipsum-383.svg',
  '/logos/logoipsum-386.svg',
  '/logos/logoipsum-394.svg',
  '/logos/logoipsum-396.svg',
  '/logos/logoipsum-407.svg',
];

// Get a random logo based on company name (deterministic)
function getCompanyLogo(companyName: string): string {
  const hash = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return companyLogos[hash % companyLogos.length];
}

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
  enrichedProfile?: {
    profileHeader?: {
      avatar?: string;
      name?: string;
      title?: string;
      company?: string;
      companyLogo?: string;
      tenure?: string;
      location?: string;
    };
    workExperience?: {
      stats?: {
        avgTenure?: string;
        currentTenure?: string;
        totalExperience?: string;
      };
      positions?: Array<{
        company: string;
        companyLogo?: string;
        totalYears?: string;
        isMultiRole?: boolean;
        roles: Array<{
          title: string;
          startDate: string;
          endDate: string;
          duration: string;
          location: string;
          description: string;
        }>;
      }>;
    };
    education?: {
      degrees?: Array<{
        degree: string;
        field: string;
        school: string;
        startYear: string;
        endYear: string;
        duration: string;
        icon?: string;
      }>;
    };
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

  // Debug logging
  console.log('=== CANDIDATE PROFILE DEBUG ===');
  console.log('Full candidate object:', candidate);
  console.log('Has enrichedProfile?', !!candidate.enrichedProfile);
  console.log('enrichedProfile data:', candidate.enrichedProfile);
  console.log('==============================');

  // Use enrichedProfile data if available, otherwise fall back to candidate data
  // The enrichedProfile structure is: {candidate_id: X, candidateProfile: {...}}
  const enrichedData = (candidate.enrichedProfile as any)?.candidateProfile || {};
  const profileData = enrichedData.profileHeader || {};
  const workExp = enrichedData.workExperience;
  const education = enrichedData.education;

  // Profile header with fallbacks
  const displayName = profileData.name || candidate.name;
  const displayTitle = profileData.title || candidate.title;
  const displayCompany = profileData.company || candidate.company;
  const displayCompanyLogo = profileData.companyLogo || candidate.companyLogo;
  const displayTenure = profileData.tenure || candidate.tenure;
  const displayAvatar = profileData.avatar || candidate.avatar;
  const displayLocation = profileData.location || 'San Francisco, CA';

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
                {displayAvatar.startsWith('http') ? (
                  <img src={displayAvatar} alt={displayName} />
                ) : (
                  <span className="avatar-emoji">{getEmoji(displayAvatar)}</span>
                )}
              </div>
              <div className="profile-card-info">
                <h1 className="profile-card-name">{displayName}</h1>
                <div className="profile-card-job">
                  <span className="job-title-text">{displayTitle}</span>
                  <span className="job-at-text"> at </span>
                  <div className="company-info-inline">
                    <div className="company-logo-small">
                      <img src={getCompanyLogo(displayCompany)} alt={displayCompany} />
                    </div>
                    <span className="company-name-text">{displayCompany}</span>
                    <span className="company-tenure-text">({displayTenure})</span>
                  </div>
                </div>
                <div className="profile-card-location">
                  <span>{displayLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Work Experience Card */}
          {workExp && (
          <div className="profile-card">
            <div className="work-exp-header">
              <h2 className="work-exp-title">Work Experience</h2>
            </div>

            {/* Stats Row */}
            {workExp.stats && (
            <div className="work-exp-stats">
              {workExp.stats.avgTenure && (
              <div className="stat-card">
                <span className="stat-label">Avg. Tenure</span>
                <span className="stat-value">{workExp.stats.avgTenure}</span>
              </div>
              )}
              {workExp.stats.currentTenure && (
              <div className="stat-card">
                <span className="stat-label">Current Tenure</span>
                <span className="stat-value">{workExp.stats.currentTenure}</span>
              </div>
              )}
              {workExp.stats.totalExperience && (
              <div className="stat-card">
                <span className="stat-label">Total Experience</span>
                <span className="stat-value">{workExp.stats.totalExperience}</span>
              </div>
              )}
            </div>
            )}

            {/* Experience Timeline */}
            {workExp.positions && workExp.positions.length > 0 && (
            <div className="experience-timeline">
              {workExp.positions.map((position: any, posIndex: number) => (
                <div key={posIndex}>
                  {posIndex > 0 && <div className="experience-divider"></div>}

                  <div className="experience-entry">
                    <div className="experience-left">
                      <div className="company-logo-timeline">
                        <img src={getCompanyLogo(position.company)} alt={position.company} />
                      </div>
                      {position.isMultiRole && position.roles.length > 1 && (
                        <div className="timeline-line"></div>
                      )}
                    </div>
                    <div className="experience-content">
                      {position.isMultiRole && position.totalYears && (
                        <div className="company-header">
                          <h3 className="company-name-link">{position.company}</h3>
                          <span className="company-total-time">{position.totalYears}</span>
                        </div>
                      )}

                      {position.roles.map((role: any, roleIndex: number) => (
                        <div key={roleIndex} className="role-entry">
                          <div className="role-title-row">
                            <span className="role-title">{role.title}</span>
                            <span className="role-at"> at </span>
                            <span className="role-company">{position.company}</span>
                          </div>
                          <div className="role-period">
                            <span>{role.startDate} - {role.endDate} ({role.duration})</span>
                            <span>{role.location}</span>
                          </div>
                          <p className="role-description">
                            {role.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
          )}

          {/* Education Card */}
          {education && education.degrees && education.degrees.length > 0 && (
          <div className="profile-card">
            <div className="education-header">
              <h2 className="education-title">Education</h2>
            </div>

            <div className="education-timeline">
              {education.degrees.map((degree: any, index: number) => (
                <div key={index}>
                  {index > 0 && <div className="education-divider"></div>}

                  <div className="education-entry">
                    <div className="education-icon">
                      <span>{getEmoji(degree.icon) || '🎓'}</span>
                    </div>
                    <div className="education-content">
                      <div className="education-degree">
                        <span className="degree-text">{degree.degree}, {degree.field}</span>
                        <span className="degree-at"> at </span>
                        <span className="school-text">{degree.school}</span>
                      </div>
                      <div className="education-period">
                        {degree.startYear} - {degree.endYear} ({degree.duration})
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CandidateProfile;
