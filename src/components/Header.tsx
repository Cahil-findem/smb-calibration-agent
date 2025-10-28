import './Header.css';

interface HeaderProps {
  onRestart?: () => void;
  title?: string;
  showCloseButton?: boolean;
  onCloseClick?: () => void;
  variant?: 'default' | 'chat';
  isChatOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onRestart,
  title = 'Search Calibration Agent',
  showCloseButton = false,
  onCloseClick,
  variant = 'default',
  isChatOpen = false
}) => {
  return (
    <header className={`app-header ${variant === 'chat' ? 'chat-variant' : ''} ${isChatOpen ? 'chat-open' : ''}`}>
      <div className="header-content">
        <div className="header-title">
          <div className="title-text">{title}</div>
        </div>
        <div className="header-actions">
          <button
            className="action-button restart-button"
            onClick={onRestart}
            title="Restart Demo"
          >
            <span className="material-icons-round">refresh</span>
          </button>
          {showCloseButton && (
            <button
              className="action-button close-button"
              onClick={onCloseClick}
              title="Close"
            >
              <span className="material-icons-round">close</span>
            </button>
          )}
          {variant === 'default' && (
            <>
              <button className="action-button help-button">
                <span className="material-icons-round">help_outline</span>
              </button>
              <button className="action-button more-button">
                <span className="material-icons-round">more_vert</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
