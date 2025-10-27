import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CandidateReview.css';

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

// Default fallback candidates
const defaultCandidates: Candidate[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    title: 'Senior Product Manager',
    company: 'Google',
    companyLogo: '🔷',
    tenure: '5 year tenure',
    avatar: '👩‍💼',
    isTopMatch: true,
    matchCriteria: {
      role: true,
      location: true,
      experience: true,
      skills: true
    },
    whyMatch: 'Sarah\'s extensive experience in product management at a leading tech company, combined with her proven track record of launching successful products, makes her an exceptional candidate. Her strategic thinking and user-centric approach align perfectly with the role requirements.'
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    title: 'Engineering Manager',
    company: 'Microsoft',
    companyLogo: '🟦',
    tenure: '7 year tenure',
    avatar: '👨‍💻',
    isTopMatch: false,
    matchCriteria: {
      role: true,
      location: true,
      experience: true,
      skills: false
    },
    whyMatch: 'Michael brings strong leadership experience managing distributed engineering teams. His background in scaling products and mentoring engineers demonstrates the technical depth and people management skills crucial for this position.'
  },
  {
    id: 3,
    name: 'Emily Watson',
    title: 'Director of Engineering',
    company: 'Amazon',
    companyLogo: '🟧',
    tenure: '4 year tenure',
    avatar: '👩‍🔬',
    isTopMatch: false,
    matchCriteria: {
      role: true,
      location: false,
      experience: true,
      skills: true
    },
    whyMatch: 'Emily\'s experience leading large-scale engineering initiatives and building high-performing teams makes her a strong fit. Her focus on innovation and delivering customer value aligns well with the company\'s goals and culture.'
  }
];

const CandidateReview: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>(defaultCandidates);

  useEffect(() => {
    // Load AI-generated candidates from localStorage
    const storedData = localStorage.getItem('demoSetupData');
    console.log('Raw localStorage data:', storedData);

    if (storedData) {
      try {
        const demoData = JSON.parse(storedData);
        console.log('Parsed demoData:', demoData);

        if (demoData.aiAnalysis) {
          const aiResponse = demoData.aiAnalysis;
          console.log('AI Analysis Response:', aiResponse);
          console.log('AI Response Type:', typeof aiResponse);
          console.log('AI Response Keys:', Object.keys(aiResponse));

          // The response should now be an array of candidate objects
          let parsedCandidates: any[] = [];

          // If the response is an array (expected structure from OpenAI)
          if (Array.isArray(aiResponse)) {
            parsedCandidates = aiResponse;
          }
          // Fallback: If the response has a candidates array
          else if (aiResponse.candidates && Array.isArray(aiResponse.candidates)) {
            parsedCandidates = aiResponse.candidates;
          }
          // Fallback: If it's a text response, try to parse JSON from it
          else if (typeof aiResponse === 'string') {
            try {
              const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                parsedCandidates = JSON.parse(jsonMatch[0]);
              }
            } catch (e) {
              console.error('Could not parse candidates from text response');
            }
          }

          console.log('Parsed candidates array:', parsedCandidates);

          // Map parsed candidates to our format
          if (parsedCandidates.length > 0) {
            const mappedCandidates = parsedCandidates.slice(0, 3).map((item: any, index: number) => {
              // Extract candidate data from the new structure
              const candidate = item.candidate || item;
              const match = item.match || {};
              const facetPills = match.facet_pills || [];

              // Helper to check match criteria from facet pills
              const rolePill = facetPills.find((p: any) => p.label === 'Role');
              const locationPill = facetPills.find((p: any) => p.label === 'Location');
              const experiencePill = facetPills.find((p: any) => p.label === 'Experience');
              const skillsPill = facetPills.find((p: any) => p.label === 'Skills');

              return {
                id: candidate.id || index + 1,
                name: candidate.full_name || candidate.name || 'Unknown Candidate',
                title: candidate.current_position?.title || candidate.title || 'Professional',
                company: candidate.current_position?.company || candidate.company || 'Tech Company',
                companyLogo: '🏢',
                tenure: candidate.current_position?.tenure_years
                  ? `${candidate.current_position.tenure_years} year tenure`
                  : '3+ years',
                avatar: candidate.avatar_url || (index === 0 ? '👨‍💼' : index === 1 ? '👩‍💼' : '👨‍💻'),
                isTopMatch: match.top_match === true || index === 0,
                matchCriteria: {
                  role: rolePill ? rolePill.state === 'match' : true,
                  location: locationPill ? locationPill.state === 'match' : true,
                  experience: experiencePill ? experiencePill.state === 'match' : true,
                  skills: skillsPill ? skillsPill.state === 'match' : true
                },
                whyMatch: match.why_rich?.text || match.why_summary || 'Strong candidate based on qualifications and experience.',
                whyRich: match.why_rich
              };
            });

            setCandidates(mappedCandidates);
            console.log('Loaded AI-generated candidates:', mappedCandidates);
          }
        }
      } catch (error) {
        console.error('Error loading AI candidates:', error);
        // Fall back to default candidates
      }
    }
  }, []);

  const handleContinue = () => {
    navigate('/next-page'); // Update to next page in flow
  };

  const handleBack = () => {
    navigate('/recipe-loader');
  };

  return (
    <div className="candidate-review-container">
      {/* Header */}
      <div className="candidate-review-header">
        <h1 className="review-title">These candidates seem like strong fits. What do you think?</h1>
      </div>

      {/* Candidates List */}
      <div className="candidates-list">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="candidate-row">
            <div className="candidate-main-info">
              <div className="candidate-details">
                <div className="candidate-avatar">
                  {candidate.avatar.startsWith('http') ? (
                    <img src={candidate.avatar} alt={candidate.name} />
                  ) : (
                    candidate.avatar
                  )}
                </div>
                <div className="candidate-text-info">
                  <div className="candidate-basic-info">
                    <h3 className="candidate-name">{candidate.name}</h3>
                    <div className="candidate-current-job">
                      <span className="job-title">{candidate.title}</span>
                      <span className="job-at"> at </span>
                      <div className="company-info">
                        <span className="company-logo">{candidate.companyLogo}</span>
                        <span className="company-name">{candidate.company}</span>
                        <span className="company-tenure">({candidate.tenure})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Chips */}
              <div className="match-chips">
                {candidate.isTopMatch && (
                  <div className="chip chip-top-match">
                    <span className="material-icons-round chip-icon">emoji_events</span>
                    <span className="chip-label">Top Match</span>
                  </div>
                )}
                {candidate.matchCriteria.role && (
                  <div className="chip chip-match">
                    <span className="material-icons-round chip-icon">check</span>
                    <span className="chip-label">Role</span>
                  </div>
                )}
                {candidate.matchCriteria.location && (
                  <div className="chip chip-match">
                    <span className="material-icons-round chip-icon">check</span>
                    <span className="chip-label">Location</span>
                  </div>
                )}
                {candidate.matchCriteria.experience && (
                  <div className="chip chip-match">
                    <span className="material-icons-round chip-icon">check</span>
                    <span className="chip-label">Experience</span>
                  </div>
                )}
                {candidate.matchCriteria.skills && (
                  <div className="chip chip-match">
                    <span className="material-icons-round chip-icon">check</span>
                    <span className="chip-label">Skills</span>
                  </div>
                )}
              </div>
            </div>

            {/* Why Match Section */}
            <div className="why-match-section">
              <h4 className="why-match-title">Why they're a match</h4>
              <p className="why-match-text">{candidate.whyMatch}</p>
              {candidate.whyRich && candidate.whyRich.highlights && candidate.whyRich.highlights.length > 0 && (
                <div className="why-highlights">
                  {candidate.whyRich.highlights.map((highlight, idx) => (
                    <span key={idx} className={`highlight-tag highlight-${highlight.category}`}>
                      {highlight.phrase}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="review-actions">
        <button className="btn btn-secondary" onClick={handleBack}>
          Back
        </button>
        <button className="btn btn-blue" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default CandidateReview;
