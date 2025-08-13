import React from 'react';
import { 
  evaluatePasswordStrength, 
  getStrengthClass, 
  getStrengthText, 
  getStrengthPercentage 
} from '../utils/passwordStrength';

export const PasswordStrengthIndicator = ({ 
  password, 
  userInputs = [], 
  showRequirements = true,
  showProgress = true,
  showFeedback = true 
}) => {
  if (!password) return null;

  const analysis = evaluatePasswordStrength(password, userInputs);
  const percentage = getStrengthPercentage(analysis.score, analysis.basicScore);

  return (
    <div className="password-strength">
      {showProgress && (
        <div className={`strength-meter ${getStrengthClass(analysis.strength)}`}>
          <div 
            className="strength-bar" 
            style={{ width: `${percentage}%` }}
            aria-label={`Password strength: ${getStrengthText(analysis.strength)}`}
          />
        </div>
      )}
      
      {showProgress && (
        <div className="strength-info">
          <span className="strength-text">
            {getStrengthText(analysis.strength)}
          </span>
          {analysis.crackTime && (
            <span className="crack-time">
              Crack time: {analysis.crackTime}
            </span>
          )}
        </div>
      )}

      {showRequirements && (
        <ul className="password-requirements" role="list">
          <li className={analysis.requirements.hasMinLength ? 'met' : 'unmet'}>
            <span className="requirement-indicator" aria-hidden="true">
              {analysis.requirements.hasMinLength ? '✓' : '○'}
            </span>
            At least 8 characters
          </li>
          <li className={analysis.requirements.hasUpperCase ? 'met' : 'unmet'}>
            <span className="requirement-indicator" aria-hidden="true">
              {analysis.requirements.hasUpperCase ? '✓' : '○'}
            </span>
            One uppercase letter
          </li>
          <li className={analysis.requirements.hasLowerCase ? 'met' : 'unmet'}>
            <span className="requirement-indicator" aria-hidden="true">
              {analysis.requirements.hasLowerCase ? '✓' : '○'}
            </span>
            One lowercase letter
          </li>
          <li className={analysis.requirements.hasNumbers ? 'met' : 'unmet'}>
            <span className="requirement-indicator" aria-hidden="true">
              {analysis.requirements.hasNumbers ? '✓' : '○'}
            </span>
            One number
          </li>
          <li className={analysis.requirements.hasSpecialChar ? 'met' : 'unmet'}>
            <span className="requirement-indicator" aria-hidden="true">
              {analysis.requirements.hasSpecialChar ? '✓' : '○'}
            </span>
            One special character
          </li>
        </ul>
      )}

      {showFeedback && analysis.feedback.warning && (
        <div className="password-warning" role="alert">
          {analysis.feedback.warning}
        </div>
      )}

      {showFeedback && analysis.feedback.suggestions.length > 0 && (
        <div className="password-suggestions">
          <ul>
            {analysis.feedback.suggestions.slice(0, 3).map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;