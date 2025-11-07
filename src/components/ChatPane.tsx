import { useState, useEffect, useRef } from 'react';
import './ChatPane.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPaneProps {
  isOpen: boolean;
  onClose: () => void;
  candidates?: any[];
  onCandidatesUpdate?: (newCandidates: any[], appended_feedback: string, isLoading?: boolean) => void;
  title?: string;
  mode?: 'candidate' | 'outreach';
  emailSubject?: string;
  emailBody?: string;
}

const ChatPane: React.FC<ChatPaneProps> = ({
  isOpen,
  onClose,
  candidates = [],
  onCandidatesUpdate,
  title = 'Candidate Calibration',
  mode = 'candidate',
  emailSubject = '',
  emailBody = ''
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appendedFeedback, setAppendedFeedback] = useState('');
  const [hasRegenerated, setHasRegenerated] = useState(false);
  const [previousCandidates, setPreviousCandidates] = useState<any[]>([]);
  const [previousFeedback, setPreviousFeedback] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const candidateSuggestions = [
    { icon: 'trending_up', text: 'They\'re too senior for what I need' },
    { icon: 'apartment', text: 'I want candidates from specific companies' },
    { icon: 'rocket_launch', text: 'These candidates don\'t have enough startup experience' }
  ];

  const outreachSuggestions = [
    { icon: 'email', text: 'Make the email more casual and friendly' },
    { icon: 'schedule', text: 'Adjust the outreach cadence timing' },
    { icon: 'edit', text: 'Change the subject line to be more engaging' }
  ];

  const suggestions = mode === 'outreach' ? outreachSuggestions : candidateSuggestions;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const sendMessage = async (userMessage: string, shouldRegenerate = false) => {
    if (!userMessage.trim() || isLoading) return;

    console.log('=== SEND MESSAGE START ===');
    console.log('Current appendedFeedback state:', appendedFeedback);
    console.log('shouldRegenerate:', shouldRegenerate);
    console.log('=========================');

    // Add user message
    let newMessages = [...messages, { role: 'user' as const, content: userMessage }];

    // If regenerating, add a system context message
    if (shouldRegenerate) {
      newMessages = [
        ...newMessages,
        { role: 'assistant' as const, content: '[SYSTEM: New candidates have been generated based on the user\'s feedback. Acknowledge this and ask if they\'d like any additional adjustments.]' }
      ];
    }

    setMessages(messages.concat([{ role: 'user' as const, content: userMessage }]));
    setMessage('');
    setIsLoading(true);

    try {
      // Get role_brief from localStorage
      const storedData = localStorage.getItem('demoSetupData');
      let role_brief = '';
      if (storedData) {
        const demoData = JSON.parse(storedData);
        role_brief = demoData.jobDescription || '';
      }

      const payload = {
        messages: newMessages,
        candidates: candidates,
        shouldRegenerateCandidates: shouldRegenerate,
        role_brief: role_brief,
        appended_feedback: appendedFeedback,
      };

      if (shouldRegenerate) {
        console.log('=== REGENERATE CANDIDATES REQUEST ===');
        console.log('Appended Feedback Being Sent:', appendedFeedback);
        console.log('Full Payload:', payload);
        console.log('=====================================');

        // Set regenerating state
        setIsRegenerating(true);

        // Notify parent that loading has started
        if (onCandidatesUpdate) {
          onCandidatesUpdate([], '', true);
        }
      }

      // Use Vercel API endpoint in production, localhost in development
      const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3004/api/recruiter-chat'
        : '/api/recruiter-chat';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('=== API RESPONSE RECEIVED ===');
      console.log('Full response data:', data);
      console.log('Has newCandidates?', !!data.newCandidates);
      console.log('============================');

      if (data.success) {
        // Only add user message to display (not the system message)
        const displayMessages = [...messages, { role: 'user' as const, content: userMessage }, { role: 'assistant' as const, content: data.response }];
        setMessages(displayMessages);

        // If new candidates were generated, update them
        if (data.newCandidates && data.newCandidates.candidates) {
          console.log('=== RECEIVED NEW CANDIDATES ===');
          console.log('Old appendedFeedback state:', appendedFeedback);
          console.log('New Appended Feedback from API:', data.newCandidates.appended_feedback);
          console.log('New Candidates:', data.newCandidates.candidates);
          console.log('===============================');

          // Store previous state for undo
          setPreviousCandidates(candidates);
          setPreviousFeedback(appendedFeedback);
          setHasRegenerated(true);

          console.log('Setting appendedFeedback to:', data.newCandidates.appended_feedback);
          setAppendedFeedback(data.newCandidates.appended_feedback);

          if (onCandidatesUpdate) {
            onCandidatesUpdate(data.newCandidates.candidates, data.newCandidates.appended_feedback);
          }
          setIsRegenerating(false);

          console.log('appendedFeedback state should now be updated (will reflect on next render)');
        }
      } else {
        console.error('Chat API error:', data.error);
        const displayMessages = [...messages, { role: 'user' as const, content: userMessage }, {
          role: 'assistant' as const,
          content: 'Sorry, I encountered an error. Please try again.'
        }];
        setMessages(displayMessages);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const displayMessages = [...messages, { role: 'user' as const, content: userMessage }, {
        role: 'assistant' as const,
        content: 'Sorry, I\'m having trouble connecting. Please try again.'
      }];
      setMessages(displayMessages);
      setIsRegenerating(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    sendMessage(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setMessage('');
    setAppendedFeedback('');
    setHasRegenerated(false);
    setPreviousCandidates([]);
    setPreviousFeedback('');
  };

  const handleUndo = () => {
    if (previousCandidates.length > 0 && onCandidatesUpdate) {
      console.log('=== UNDOING CANDIDATE REGENERATION ===');
      console.log('Restoring previous candidates:', previousCandidates);
      console.log('Restoring previous feedback:', previousFeedback);
      console.log('======================================');

      onCandidatesUpdate(previousCandidates, previousFeedback);
      setAppendedFeedback(previousFeedback);
      setHasRegenerated(false);
      setPreviousCandidates([]);
      setPreviousFeedback('');
    }
  };

  return (
    <div className={`chat-pane ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="chat-pane-header">
        <div className="chat-pane-title">
          {messages.length > 0 && (
            <span className="material-icons-round">auto_awesome</span>
          )}
          <h2>{title}</h2>
        </div>
        <div className="chat-pane-actions">
          <button className="icon-btn" onClick={handleReset} aria-label="Reset conversation">
            <span className="material-icons-round">refresh</span>
          </button>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <span className="material-icons-round">close</span>
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="chat-pane-content">
        <div className={`chat-pane-messages ${messages.length === 0 ? 'empty' : 'with-messages'}`}>
          {messages.length === 0 ? (
            <>
              {/* AI Logo */}
              <div className="ai-logo-container">
                <div className="ai-logo-bg">
                  <img
                    src="/ai-logo.svg"
                    alt="AI Assistant"
                    className="ai-logo-icon"
                  />
                </div>
              </div>

              {/* Initial Message */}
              <div className="chat-initial-message">
                What do you think about these candidates?
              </div>

              {/* Suggestions */}
              <div className="chat-suggestions">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="chat-suggestion-btn"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    disabled={isLoading}
                  >
                    <span className="material-icons-round suggestion-icon">
                      {suggestion.icon}
                    </span>
                    <span className="suggestion-text">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Conversation Messages */}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={msg.role === 'user' ? 'user-message' : 'ai-message'}
                >
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="ai-message loading">
                  <img
                    className="loading-gif"
                    src="/AI Loader.gif"
                    alt="Loading animation"
                  />
                  <span>{isRegenerating ? 'Regenerating candidates...' : 'Thinking...'}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="chat-pane-input-container">
          {/* Regenerate/Undo Buttons (show after 2+ messages) */}
          {messages.length >= 2 && (
            <div className="candidate-action-buttons">
              {hasRegenerated && (
                <button
                  className="undo-candidates-btn"
                  onClick={handleUndo}
                  disabled={isLoading}
                >
                  <span className="material-icons-round">undo</span>
                  <span>Undo</span>
                </button>
              )}
              <button
                className="regenerate-candidates-btn"
                onClick={() => {
                  if (!isLoading) {
                    sendMessage('Based on our conversation, please show me updated candidates.', true);
                  }
                }}
                disabled={isLoading}
              >
                <span>Regenerate List</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="chat-pane-input-form">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask, refine, or request anything..."
              className="chat-pane-input"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="chat-pane-input-actions">
              <button type="button" className="input-action-btn" aria-label="Voice input">
                <span className="material-icons-round">mic</span>
              </button>
              <button
                type="submit"
                className={`input-send-btn ${message.trim() ? 'active' : 'inactive'}`}
                disabled={!message.trim()}
                aria-label="Send message"
              >
                <span className="material-icons-round">arrow_upward</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPane;
