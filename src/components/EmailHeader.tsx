import './EmailHeader.css';

interface EmailHeaderProps {
  subject: string;
}

const EmailHeader: React.FC<EmailHeaderProps> = ({ subject }) => {
  return (
    <div className="email-header-container">
      <div className="email-header-wrapper">
        {/* Campaign Preview Chip */}
        <div className="email-header-row">
          <div className="campaign-preview-chip-header">
            <img src="/campaign-preview-chip.svg" alt="" className="chip-background" />
            <div className="chip-content">
              <span className="material-icons-round">auto_awesome</span>
              <span>Campaign Preview</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="email-header-divider"></div>

        {/* Subject */}
        <div className="email-header-row">
          <span className="email-label">Subject:</span>
          <p className="email-subject-text">{subject}</p>
        </div>
      </div>
    </div>
  );
};

export default EmailHeader;
