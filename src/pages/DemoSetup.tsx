import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DemoSetup.css';

interface DemoSetupData {
  userName: string;
  timestamp: number;
}

const DemoSetup: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Gemma');
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLaunchDemo();
    }
  };

  const handleLaunchDemo = async () => {
    // Validate inputs
    if (!userName.trim()) {
      alert('Please enter your first name');
      return;
    }

    setIsLoading(true);

    const demoData: DemoSetupData = {
      userName: userName.trim(),
      timestamp: Date.now()
    };

    // Save to localStorage for session persistence
    localStorage.setItem('demoSetupData', JSON.stringify(demoData));

    // Save to sessionStorage as backup
    sessionStorage.setItem('demoSetupData', JSON.stringify(demoData));

    console.log('Demo setup saved:', demoData);

    // Navigate to Onboarding page with name parameter
    navigate(`/onboarding?name=${encodeURIComponent(userName.trim())}`);

    setIsLoading(false);
  };

  return (
    <div className="demo-setup">
      <div className="demo-setup-container">
        <div className="demo-setup-content">
          {/* Header Section */}
          <div className="demo-setup-header">
            <h1 className="demo-setup-title">Setup Your Demo</h1>
            <p className="demo-setup-subtitle">
              Provide us with the details required to make the demo slap 👋
            </p>
          </div>

          {/* Form Section */}
          <div className="demo-setup-form">
            {/* User First Name Field */}
            <div className="form-field">
              <div className="field-label-container">
                <label className="field-label">First Name</label>
              </div>
              <div className="field-input-container">
                <div className="field-input-wrapper">
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Enter your first name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Launch Demo Button */}
          <div className="demo-setup-actions">
            <button
              className="save-button"
              onClick={handleLaunchDemo}
              disabled={isLoading}
            >
              <span className="save-button-text">
                {isLoading ? 'Launching...' : 'Launch Demo'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoSetup;
