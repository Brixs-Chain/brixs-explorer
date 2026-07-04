import React, { useState } from 'react';
import { X, Copy, Check, Shield } from 'lucide-react';
import './ApiKeyModal.css';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setApiKey(`brx_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="modal-header">
          <div className="icon-wrapper">
            <Shield size={32} color="var(--accent-primary)" />
          </div>
          <h2>Brixs Testnet API Key</h2>
          <p>Generate a free API key to access the Brixs Testnet RPC and Explorer endpoints.</p>
        </div>

        <div className="modal-body">
          {!apiKey ? (
            <div className="generate-section">
              <button 
                className="btn-primary w-full" 
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate New Key'}
              </button>
            </div>
          ) : (
            <div className="key-result-section">
              <label>Your API Key</label>
              <div className="key-box">
                <code>{apiKey}</code>
                <button className="icon-btn" onClick={handleCopy} title="Copy to clipboard">
                  {copied ? <Check size={18} color="var(--accent-green)" /> : <Copy size={18} />}
                </button>
              </div>
              <div className="warning-box">
                <strong>Important:</strong> Please store this key securely. You won't be able to see it again.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
