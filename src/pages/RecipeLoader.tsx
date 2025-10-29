import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './RecipeLoader.css';

interface LoadingCard {
  id: number;
  icon: string;
  title: string;
  text: string;
  visible: boolean;
}

const RecipeLoader: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cards, setCards] = useState<LoadingCard[]>([
    {
      id: 1,
      icon: 'article',
      title: 'Reviewing your role and screening questions',
      text: '',
      visible: false
    },
    {
      id: 2,
      icon: 'search',
      title: 'Analyzing candidate profiles',
      text: '',
      visible: false
    },
    {
      id: 3,
      icon: 'work',
      title: 'Understanding the role and responsibilities',
      text: '',
      visible: false
    },
    {
      id: 4,
      icon: 'person',
      title: 'Generating ideal candidate profiles',
      text: '',
      visible: false
    }
  ]);

  const [showContinue, setShowContinue] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const showCard = (index: number) => {
      setTimeout(() => {
        setCards(prev => prev.map((card, i) =>
          i === index ? { ...card, visible: true } : card
        ));
      }, index * 1800); // Stagger each card by 1.8 seconds
    };

    // Show each card with a delay
    cards.forEach((_, index) => {
      showCard(index);
    });

    // Poll localStorage for candidate data
    const checkForCandidates = () => {
      const storedData = localStorage.getItem('demoSetupData');
      if (storedData) {
        try {
          const demoData = JSON.parse(storedData);
          if (demoData.aiAnalysis && Array.isArray(demoData.aiAnalysis) && demoData.aiAnalysis.length > 0) {
            console.log('Candidate data loaded! Showing completed state.');
            setShowContinue(true);
            setIsComplete(true);
            return true;
          }
        } catch (error) {
          console.error('Error checking for candidates:', error);
        }
      }
      return false;
    };

    // Check immediately
    if (checkForCandidates()) {
      return;
    }

    // Poll every second for candidate data
    const pollInterval = setInterval(() => {
      if (checkForCandidates()) {
        clearInterval(pollInterval);
      }
    }, 1000);

    // Cleanup
    return () => clearInterval(pollInterval);
  }, []);

  const handleContinue = () => {
    // Preserve name parameter if it exists
    const nameParam = searchParams.get('name');
    if (nameParam) {
      navigate(`/candidate-review?name=${encodeURIComponent(nameParam)}`);
    } else {
      navigate('/candidate-review');
    }
  };

  const handleRestartDemo = () => {
    // Clear localStorage and navigate back to start
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="recipe-loader">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: '90%' }}></div>
      </div>

      <div className="recipe-loader-container">
        {/* Header with Logo */}
        <div className="title-section">
          <div className="title-with-logo">
            <img
              className="x-logo"
              src="/AI Loader.gif"
              alt="Logo"
              style={{ opacity: isComplete ? 0 : 1, transition: 'opacity 0.3s ease' }}
            />
            <h1 className="page-title">
              {isComplete ? 'All done, hit continue when you are ready' : 'Hang tight while I process your requirements'}
            </h1>
          </div>
        </div>

        {/* Loading Cards */}
        <div className="loading-cards">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`loading-card ${card.visible ? 'visible' : ''}`}
            >
              <div className={`card-icon ${isComplete ? 'completed' : ''}`}>
                <span className="material-icons-round">
                  {isComplete ? 'check_circle' : card.icon}
                </span>
              </div>
              <div className="card-content">
                <h3 className="card-title">{card.title}</h3>
                {card.text && <p className="card-text">{card.text}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        {showContinue && (
          <div className="recipe-loader-actions">
            <button
              className="continue-button"
              onClick={handleContinue}
            >
              <span className="continue-button-text">Continue</span>
            </button>
          </div>
        )}
      </div>

      {/* Restart Demo Button */}
      <button
        className="restart-demo-button"
        onClick={handleRestartDemo}
        title="Restart Demo"
      >
        <span className="material-icons-round">refresh</span>
        <span className="restart-text">Restart</span>
      </button>
    </div>
  );
};

export default RecipeLoader;
