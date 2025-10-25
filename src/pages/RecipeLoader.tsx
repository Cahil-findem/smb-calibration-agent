import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

    // Show continue button 2 seconds after the last card appears
    const showContinueTimer = setTimeout(() => {
      setShowContinue(true);
      setIsComplete(true);
    }, (cards.length * 1800) + 2000);

    // Cleanup timer on unmount
    return () => clearTimeout(showContinueTimer);
  }, []);

  const handleContinue = () => {
    // Navigate to next page in your flow
    navigate('/next-page'); // Update this to the next page
  };

  const handleRestartDemo = () => {
    // Clear localStorage and navigate back to start
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="recipe-loader">
      <div className="recipe-loader-container">
        {/* Header with Logo */}
        <div className="title-section">
          <div className="title-with-logo">
            {!isComplete && (
              <img
                className="x-logo"
                src="/AI Loader.gif"
                alt="Logo"
              />
            )}
            <h1 className="page-title" style={{ marginLeft: isComplete ? '0' : undefined }}>
              {isComplete ? 'All done, hit continue when you are ready' : 'Great - hang tight while I understand your requirements'}
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
