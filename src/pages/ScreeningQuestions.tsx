import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './ScreeningQuestions.css';

const ScreeningQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState<string[]>([
    'Do you have experience with React and TypeScript?',
    'Are you comfortable working remotely?',
    'What is your expected salary range?'
  ]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');

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
        const demoData = {
          userName: nameFromUrl,
          timestamp: Date.now()
        };
        localStorage.setItem('demoSetupData', JSON.stringify(demoData));
      }
    }

    // Load generated screening questions from localStorage
    const storedData = localStorage.getItem('demoSetupData');
    if (storedData) {
      try {
        const demoData = JSON.parse(storedData);
        if (demoData.screeningQuestions && Array.isArray(demoData.screeningQuestions) && demoData.screeningQuestions.length === 3) {
          setQuestions(demoData.screeningQuestions);
        }
      } catch (error) {
        console.error('Error loading screening questions:', error);
      }
    }
  }, [searchParams]);

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = value;
    setQuestions(updatedQuestions);

    // Store questions in localStorage
    const storedData = localStorage.getItem('demoSetupData');
    if (storedData) {
      try {
        const demoData = JSON.parse(storedData);
        demoData.screeningQuestions = updatedQuestions;
        localStorage.setItem('demoSetupData', JSON.stringify(demoData));
      } catch (error) {
        console.error('Error updating demo setup data:', error);
      }
    }
  };

  const handleAddQuestion = () => {
    const updatedQuestions = [...questions, ''];
    setQuestions(updatedQuestions);

    // Store questions in localStorage
    const storedData = localStorage.getItem('demoSetupData');
    if (storedData) {
      try {
        const demoData = JSON.parse(storedData);
        demoData.screeningQuestions = updatedQuestions;
        localStorage.setItem('demoSetupData', JSON.stringify(demoData));
      } catch (error) {
        console.error('Error updating demo setup data:', error);
      }
    }
  };

  const handleDeleteQuestion = (index: number) => {
    if (index < 3) return; // Don't allow deleting first 3 questions

    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);

    // Store questions in localStorage
    const storedData = localStorage.getItem('demoSetupData');
    if (storedData) {
      try {
        const demoData = JSON.parse(storedData);
        demoData.screeningQuestions = updatedQuestions;
        localStorage.setItem('demoSetupData', JSON.stringify(demoData));
      } catch (error) {
        console.error('Error updating demo setup data:', error);
      }
    }
  };

  const handleContinue = () => {
    // Check if all questions are filled
    const allFilled = questions.every(q => q.trim() !== '');
    if (allFilled) {
      setTransitionDirection('forward');
      setIsTransitioning(true);
      setTimeout(() => {
        // Preserve name parameter if it exists
        const nameParam = searchParams.get('name');
        if (nameParam) {
          navigate(`/recipe-loader?name=${encodeURIComponent(nameParam)}`);
        } else {
          navigate('/recipe-loader');
        }
      }, 600);
    }
  };

  const handleBack = () => {
    setTransitionDirection('backward');
    setIsTransitioning(true);
    setTimeout(() => {
      // Preserve name parameter if it exists
      const nameParam = searchParams.get('name');
      if (nameParam) {
        navigate(`/goal-selection?name=${encodeURIComponent(nameParam)}`);
      } else {
        navigate('/goal-selection');
      }
    }, 600);
  };

  const allQuestionsFilled = questions.every(q => q.trim() !== '');

  return (
    <div className="screening-questions-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: '80%' }}></div>
      </div>

      {/* Main Content */}
      <div className="screening-questions-content">
        <div className="content-inner">
          <div className={`title-section ${isTransitioning ? (transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down') : 'animate-fade-up'}`}>
            <div className="title-with-logo">
              <img
                className="x-logo"
                src="/AI Loader.gif"
                alt="Logo"
              />
              <h1 className="page-title">
                I've drafted three screening questions based on your role. Feel free to edit or add more if you'd like.
              </h1>
            </div>
          </div>

          <div className={`questions-list ${isTransitioning ? (transitionDirection === 'forward' ? 'animate-fade-out-up' : 'animate-fade-out-down') : 'animate-fade-up animate-delay-1'}`}>
            {questions.map((question, index) => (
              <div key={index} className="question-item">
                <div
                  className={`question-number ${index >= 3 ? 'deletable' : ''}`}
                  onClick={() => index >= 3 && handleDeleteQuestion(index)}
                >
                  <span className="number-text">{index + 1}</span>
                  {index >= 3 && (
                    <span className="material-icons-round delete-icon">delete</span>
                  )}
                </div>
                <textarea
                  className="question-input"
                  value={question}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  placeholder={`Question ${index + 1}`}
                  rows={2}
                />
              </div>
            ))}

            <div className="question-item add-question-item" onClick={handleAddQuestion}>
              <div className="question-number add-question-number">
                <span className="material-icons-round">add</span>
              </div>
              <div className="add-question-text">Add another question</div>
            </div>
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
                className={`btn btn-blue ${!allQuestionsFilled ? 'disabled' : ''}`}
                onClick={handleContinue}
              >
                Continue
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreeningQuestions;
