import './EmailGenerationLoader.css';

const EmailGenerationLoader: React.FC = () => {
  return (
    <div className="email-generation-loader">
      <iframe
        src="https://maui.findem.ai/iframe.html?args=texts[0].message:Understanding+your+role;texts[1].message:Exploring+candidate+profiles;texts[2].message:Personalizing+outreach+content;texts[3].message:Building+a+personal+connection;texts[4].message:Including+screening+questions;texts[5].message:Finalizing+next+steps&id=feedback-loader--text-progress-default&viewMode=story"
        title="Email Generation Progress"
        className="loader-iframe"
      />
    </div>
  );
};

export default EmailGenerationLoader;
