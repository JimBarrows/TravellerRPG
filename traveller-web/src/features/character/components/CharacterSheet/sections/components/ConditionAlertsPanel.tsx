/**
 * Condition Alerts Panel Component
 * Displays urgent warnings and alerts about dangerous conditions
 */

import React from 'react';

interface Alert {
  type: 'danger' | 'warning' | 'info';
  message: string;
}

interface ConditionAlertsPanelProps {
  alerts: Alert[];
}

const ConditionAlertsPanel: React.FC<ConditionAlertsPanelProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  const getAlertStyling = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  // Sort alerts by severity (danger first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priority = { danger: 3, warning: 2, info: 1 };
    return priority[b.type] - priority[a.type];
  });

  return (
    <div className="space-y-2">
      {sortedAlerts.map((alert, index) => (
        <div
          key={index}
          className={`p-4 border rounded-lg ${getAlertStyling(alert.type)}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0" role="img" aria-label={alert.type}>
              {getAlertIcon(alert.type)}
            </span>
            <div className="flex-1">
              <div className="font-medium text-sm">
                {alert.type === 'danger' && 'Critical Alert'}
                {alert.type === 'warning' && 'Warning'}
                {alert.type === 'info' && 'Information'}
              </div>
              <div className="text-sm mt-1">{alert.message}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConditionAlertsPanel;