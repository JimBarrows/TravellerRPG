import { useState } from 'react';
import type { CharacterCharacteristics } from '../../../types/characterCreation';
import { toUPP, getCharacteristicAbbreviation } from '../../../types/characterSheet';

interface UPPDisplayProps {
  characteristics: CharacterCharacteristics;
  className?: string;
  showBreakdown?: boolean;
  showCopyButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const UPPDisplay = ({ 
  characteristics, 
  className = '',
  showBreakdown = false,
  showCopyButton = true,
  size = 'md'
}: UPPDisplayProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const upp = toUPP(characteristics);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy UPP:', error);
    }
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const containerClasses = `
    font-mono font-bold 
    ${sizeClasses[size]}
    ${showCopyButton ? 'cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors' : ''}
    ${className}
  `.trim();

  const characteristicEntries = Object.entries(characteristics) as [keyof CharacterCharacteristics, number][];

  return (
    <div className="relative inline-block">
      <div
        className={containerClasses}
        onClick={showCopyButton ? handleCopy : undefined}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role={showCopyButton ? "button" : undefined}
        tabIndex={showCopyButton ? 0 : undefined}
        onKeyDown={showCopyButton ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCopy();
          }
        } : undefined}
        aria-label={showCopyButton ? `UPP: ${upp}. Click to copy` : `UPP: ${upp}`}
        title={showCopyButton ? "Click to copy UPP" : "Universal Personality Profile"}
      >
        {upp.split('').map((char, index) => (
          <span 
            key={index}
            className={`
              ${char >= 'A' ? 'text-purple-600' : 'text-current'}
              ${char === '0' ? 'text-red-600' : ''}
              ${char === '1' ? 'text-red-500' : ''}
            `}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Copy feedback */}
      {copied && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-green-600 text-white text-xs rounded whitespace-nowrap">
          Copied!
        </div>
      )}

      {/* Breakdown tooltip */}
      {showTooltip && showBreakdown && (
        <div className="absolute z-10 -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          <div className="grid grid-cols-6 gap-1 text-center">
            {characteristicEntries.map(([name, value], index) => (
              <div key={name} className="flex flex-col">
                <div className="text-xs opacity-75">
                  {getCharacteristicAbbreviation(name)}
                </div>
                <div className="font-mono">
                  {upp[index]}
                </div>
                <div className="text-xs opacity-75">
                  ({value})
                </div>
              </div>
            ))}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default UPPDisplay;