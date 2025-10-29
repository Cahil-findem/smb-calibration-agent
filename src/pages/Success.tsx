import './Success.css';

const Success: React.FC = () => {
  return (
    <div className="success-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: '100%' }}></div>
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
