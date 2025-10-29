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
          <img
            className="logo animate-fade-up"
            src="/AI Loader.gif"
            alt="Loading animation"
          />

          <div className="greeting-section animate-fade-up animate-delay-1">
            <div className="greeting-header">
              <div className="greeting-title">
                Sourcing is active.
              </div>
            </div>
            <div className="greeting-body">
              <div className="welcome-message-container">
                <div className="welcome-message">
                  Keep an eye on your inbox for candidates that are ready to interview
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
