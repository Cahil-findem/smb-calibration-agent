import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import './Success.css';

const Success: React.FC = () => {
  useEffect(() => {
    // Fire confetti on page load
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fire confetti from two sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="success-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill success-progress" style={{ width: '100%' }}></div>
      </div>

      {/* Main Content */}
      <div className="success-content">
        <div className="content-inner">
          <div className="check-icon-wrapper animate-fade-up">
            <span className="material-icons-round check-icon">check</span>
          </div>

          <div className="greeting-section animate-fade-up animate-delay-1">
            <div className="greeting-header">
              <div className="greeting-title">
                Sourcing activated.
              </div>
            </div>
            <div className="greeting-body">
              <div className="welcome-message-container">
                <div className="welcome-message">
                  I'll keep you updated as I find matches. Expect interested candidates in your inbox within two weeks.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
