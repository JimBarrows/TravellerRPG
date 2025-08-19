import React, { useState, useMemo } from 'react';
import type { CharacterSheetData } from '../../types/characterSheet';
import Card, { CardHeader, CardContent } from '../../../../shared/components/molecules/Card';
import Button from '../../../../shared/components/atoms/Button';

interface ConflictResolverProps {
  localData: CharacterSheetData;
  serverData: CharacterSheetData;
  onResolve: (resolvedData: CharacterSheetData, strategy: 'local' | 'server' | 'merge') => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface FieldConflict {
  field: string;
  localValue: any;
  serverValue: any;
  resolved: 'local' | 'server' | null;
}

const ConflictResolver: React.FC<ConflictResolverProps> = ({
  localData,
  serverData,
  onResolve,
  onCancel,
  isOpen,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'local' | 'server' | 'merge'>('merge');
  const [customResolutions, setCustomResolutions] = useState<Record<string, 'local' | 'server'>>({});

  // Compare data and find conflicts
  const conflicts = useMemo((): FieldConflict[] => {
    const found: FieldConflict[] = [];

    const compareObjects = (local: any, server: any, path: string = '') => {
      if (local === server) return;

      if (typeof local !== typeof server) {
        found.push({
          field: path,
          localValue: local,
          serverValue: server,
          resolved: null,
        });
        return;
      }

      if (Array.isArray(local) && Array.isArray(server)) {
        if (JSON.stringify(local) !== JSON.stringify(server)) {
          found.push({
            field: path,
            localValue: local,
            serverValue: server,
            resolved: null,
          });
        }
        return;
      }

      if (typeof local === 'object' && local !== null && server !== null) {
        const allKeys = new Set([...Object.keys(local), ...Object.keys(server)]);
        
        for (const key of allKeys) {
          const newPath = path ? `${path}.${key}` : key;
          compareObjects(local[key], server[key], newPath);
        }
        return;
      }

      if (local !== server) {
        found.push({
          field: path,
          localValue: local,
          serverValue: server,
          resolved: null,
        });
      }
    };

    compareObjects(localData, serverData);
    return found;
  }, [localData, serverData]);

  const formatFieldName = (field: string): string => {
    return field
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' → ');
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return `Array (${value.length} items)`;
      }
      return JSON.stringify(value, null, 2);
    }
    
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    
    return String(value);
  };

  const handleFieldResolution = (field: string, resolution: 'local' | 'server') => {
    setCustomResolutions(prev => ({
      ...prev,
      [field]: resolution,
    }));
  };

  const generateResolvedData = (): CharacterSheetData => {
    if (selectedStrategy === 'local') {
      return localData;
    }
    
    if (selectedStrategy === 'server') {
      return serverData;
    }

    // Merge strategy - use custom resolutions or default to server
    let resolvedData = { ...serverData };

    conflicts.forEach(conflict => {
      const resolution = customResolutions[conflict.field] || 'server';
      const sourceData = resolution === 'local' ? localData : serverData;
      
      // Set the resolved value using the field path
      const pathParts = conflict.field.split('.');
      let current = resolvedData;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
      }
      
      const fieldValue = pathParts.reduce((obj, key) => obj?.[key], sourceData);
      current[pathParts[pathParts.length - 1]] = fieldValue;
    });

    return resolvedData;
  };

  const handleResolve = () => {
    const resolvedData = generateResolvedData();
    onResolve(resolvedData, selectedStrategy);
  };

  const getStrategyDescription = (strategy: 'local' | 'server' | 'merge'): string => {
    switch (strategy) {
      case 'local':
        return 'Keep all your local changes and discard server changes';
      case 'server':
        return 'Discard your local changes and use the server version';
      case 'merge':
        return 'Choose which changes to keep for each conflict';
      default:
        return '';
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-screen overflow-hidden">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-red-700">Conflict Detected</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  The character has been modified elsewhere. Please resolve conflicts to continue.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {/* Strategy Selection */}
              <div>
                <h3 className="text-lg font-medium mb-3">Resolution Strategy</h3>
                <div className="space-y-3">
                  {(['local', 'server', 'merge'] as const).map(strategy => (
                    <label key={strategy} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="strategy"
                        value={strategy}
                        checked={selectedStrategy === strategy}
                        onChange={(e) => setSelectedStrategy(e.target.value as any)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium capitalize">{strategy} Version</div>
                        <div className="text-sm text-muted-foreground">
                          {getStrategyDescription(strategy)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Conflict Details */}
              {conflicts.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Conflicts Found ({conflicts.length})
                  </h3>
                  
                  {selectedStrategy === 'merge' && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose which version to use for each conflicted field:
                    </p>
                  )}

                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {conflicts.map((conflict, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <h4 className="font-medium mb-3">
                          {formatFieldName(conflict.field)}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Local Version */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-600">
                                Your Version
                              </span>
                              {selectedStrategy === 'merge' && (
                                <input
                                  type="radio"
                                  name={`conflict-${index}`}
                                  value="local"
                                  checked={customResolutions[conflict.field] === 'local'}
                                  onChange={() => handleFieldResolution(conflict.field, 'local')}
                                />
                              )}
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                              <pre className="whitespace-pre-wrap break-words">
                                {formatValue(conflict.localValue)}
                              </pre>
                            </div>
                          </div>

                          {/* Server Version */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-600">
                                Server Version
                              </span>
                              {selectedStrategy === 'merge' && (
                                <input
                                  type="radio"
                                  name={`conflict-${index}`}
                                  value="server"
                                  checked={
                                    customResolutions[conflict.field] === 'server' ||
                                    !customResolutions[conflict.field]
                                  }
                                  onChange={() => handleFieldResolution(conflict.field, 'server')}
                                />
                              )}
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                              <pre className="whitespace-pre-wrap break-words">
                                {formatValue(conflict.serverValue)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                <Button
                  variant="primary"
                  onClick={handleResolve}
                  className="flex-1"
                >
                  Resolve Conflicts
                </Button>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z" />
                  </svg>
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Important:</p>
                    <p>
                      Resolving conflicts will save the merged data immediately. 
                      Make sure you review all changes before proceeding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConflictResolver;