import React, { useState, useMemo } from 'react';
import type { CharacterFinances } from '../../../../types/characterSheet';
import { creditAmountSchema } from '../../../../validation/schemas';
import Card, { CardHeader, CardContent } from '../../../../../../shared/components/molecules/Card';
import Button from '../../../../../../shared/components/atoms/Button';
import Modal from '../../../../../../shared/components/molecules/Modal';
import { EditableNumber, EditableText, EditableSelect } from '../../../EditableFields';

interface AssetTrackerProps {
  assets: CharacterFinances['assets'];
  onUpdateAssets: (assets: CharacterFinances['assets']) => void;
  readonly?: boolean;
}

interface Asset extends CharacterFinances['assets'][0] {
  // Extended properties for better tracking
  purchaseDate?: string;
  appreciationRate?: number; // Annual appreciation/depreciation rate
  maintenanceCost?: number; // Annual maintenance cost
  lastValuation?: string;
  insuranceValue?: number;
  notes?: string;
}

const AssetTracker: React.FC<AssetTrackerProps> = ({
  assets,
  onUpdateAssets,
  readonly = false
}) => {
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'value'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | Asset['type']>('all');

  // Asset type configurations with Traveller RPG context
  const assetTypes = [
    { 
      value: 'property', 
      label: 'Property', 
      icon: '🏢',
      examples: ['Apartment', 'House', 'Office Building', 'Warehouse', 'Land'],
      description: 'Real estate and property holdings'
    },
    { 
      value: 'investment', 
      label: 'Investment', 
      icon: '📈',
      examples: ['Stocks', 'Bonds', 'Mutual Funds', 'Corporate Shares', 'Trade Ventures'],
      description: 'Financial investments and securities'
    },
    { 
      value: 'vehicle', 
      label: 'Vehicle', 
      icon: '🚗',
      examples: ['Air/Raft', 'Ground Car', 'Grav Belt', 'ATV', 'Speeder'],
      description: 'Personal vehicles and transport'
    },
    { 
      value: 'ship', 
      label: 'Ship/Starship', 
      icon: '🚀',
      examples: ['Scout Ship', 'Free Trader', 'Far Trader', 'Yacht', 'Patrol Boat'],
      description: 'Spacecraft and starships'
    },
    { 
      value: 'other', 
      label: 'Other', 
      icon: '💎',
      examples: ['Jewelry', 'Art', 'Antiques', 'Equipment', 'Business'],
      description: 'Other valuable assets'
    }
  ];

  // Enhanced assets with calculated properties
  const enhancedAssets = useMemo(() => {
    return assets.map(asset => {
      const assetConfig = assetTypes.find(t => t.value === asset.type);
      const age = asset.purchaseDate 
        ? (Date.now() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
        : 0;
      
      // Calculate depreciation/appreciation
      let currentValue = asset.value;
      if (asset.appreciationRate && age > 0) {
        currentValue = asset.value * Math.pow(1 + (asset.appreciationRate / 100), age);
      }
      
      return {
        ...asset,
        assetConfig,
        age: Math.floor(age),
        currentValue: Math.round(currentValue),
        totalMaintenanceCost: asset.maintenanceCost ? asset.maintenanceCost * age : 0
      };
    });
  }, [assets]);

  // Filter and sort assets
  const filteredAndSortedAssets = useMemo(() => {
    let filtered = enhancedAssets;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(asset => asset.type === filterType);
    }
    
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'value':
          comparison = a.currentValue - b.currentValue;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [enhancedAssets, sortBy, sortOrder, filterType]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredAndSortedAssets.reduce((acc, asset) => {
      acc.totalValue += asset.currentValue;
      acc.originalValue += asset.value;
      acc.maintenanceCosts += asset.totalMaintenanceCost;
      return acc;
    }, { 
      totalValue: 0, 
      originalValue: 0, 
      maintenanceCosts: 0,
      count: filteredAndSortedAssets.length 
    });
  }, [filteredAndSortedAssets]);

  // Asset portfolio breakdown
  const portfolioBreakdown = useMemo(() => {
    const breakdown = assetTypes.map(type => {
      const typeAssets = enhancedAssets.filter(asset => asset.type === type.value);
      const totalValue = typeAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
      const percentage = totals.totalValue > 0 ? (totalValue / totals.totalValue) * 100 : 0;
      
      return {
        ...type,
        count: typeAssets.length,
        totalValue,
        percentage
      };
    }).filter(type => type.count > 0);
    
    return breakdown.sort((a, b) => b.totalValue - a.totalValue);
  }, [enhancedAssets, totals.totalValue]);

  const handleSort = (field: typeof sortBy) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const addAsset = (assetData: Omit<Asset, 'id'>) => {
    const newAsset = {
      ...assetData,
      id: crypto.randomUUID(),
    };
    
    onUpdateAssets([...assets, newAsset]);
    setShowAssetModal(false);
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    const updatedAssets = assets.map(asset => 
      asset.id === id ? { ...asset, ...updates } : asset
    );
    
    onUpdateAssets(updatedAssets);
    setEditingAsset(null);
    setShowAssetModal(false);
  };

  const deleteAsset = (id: string) => {
    onUpdateAssets(assets.filter(asset => asset.id !== id));
  };

  const getAssetHealthColor = (asset: any): string => {
    if (asset.appreciationRate && asset.appreciationRate > 0) return 'text-green-600';
    if (asset.appreciationRate && asset.appreciationRate < -5) return 'text-red-600';
    return 'text-blue-600';
  };

  const formatCurrency = (amount: number): string => {
    return `Cr${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-2xl font-bold text-blue-700">
            {totals.count}
          </div>
          <div className="text-sm text-blue-600">Total Assets</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-2xl font-bold text-green-700">
            {formatCurrency(totals.totalValue)}
          </div>
          <div className="text-sm text-green-600">Current Value</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="text-2xl font-bold text-purple-700">
            {formatCurrency(totals.originalValue)}
          </div>
          <div className="text-sm text-purple-600">Original Value</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className={`text-2xl font-bold ${
            totals.totalValue - totals.originalValue >= 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            {totals.totalValue - totals.originalValue >= 0 ? '+' : ''}{formatCurrency(totals.totalValue - totals.originalValue)}
          </div>
          <div className="text-sm text-gray-600">Net Change</div>
        </div>
      </div>

      {/* Portfolio Breakdown */}
      {portfolioBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">📊 Portfolio Breakdown</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioBreakdown.map((type) => (
                <div key={type.value} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {type.count} asset{type.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(type.totalValue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {type.percentage.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, type.percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Asset List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">💼 Asset Portfolio</h3>
            {!readonly && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAssetModal(true)}
              >
                ➕ Add Asset
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Filters and Sorting */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Type:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="p-2 border border-border rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  {assetTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Sort by:</label>
                <button
                  onClick={() => handleSort('name')}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    sortBy === 'name' ? 'bg-primary text-primary-foreground' : 'bg-background'
                  }`}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('type')}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    sortBy === 'type' ? 'bg-primary text-primary-foreground' : 'bg-background'
                  }`}
                >
                  Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('value')}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    sortBy === 'value' ? 'bg-primary text-primary-foreground' : 'bg-background'
                  }`}
                >
                  Value {sortBy === 'value' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>

            {/* Asset Cards */}
            {filteredAndSortedAssets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {filterType === 'all' 
                  ? 'No assets recorded yet' 
                  : `No ${assetTypes.find(t => t.value === filterType)?.label.toLowerCase()} assets found`
                }
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedAssets.map((asset) => (
                  <div 
                    key={asset.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{asset.assetConfig?.icon || '💎'}</span>
                          <div>
                            <h4 className="font-semibold">{asset.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="capitalize">{asset.type}</span>
                              {asset.age > 0 && (
                                <span>• {asset.age} year{asset.age !== 1 ? 's' : ''} old</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Current Value</div>
                            <div className={`font-semibold ${getAssetHealthColor(asset)}`}>
                              {formatCurrency(asset.currentValue)}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-muted-foreground">Original Value</div>
                            <div className="font-mono">
                              {formatCurrency(asset.value)}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-muted-foreground">Change</div>
                            <div className={`font-semibold ${
                              asset.currentValue - asset.value >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {asset.currentValue - asset.value >= 0 ? '+' : ''}{formatCurrency(asset.currentValue - asset.value)}
                              {asset.value > 0 && (
                                <span className="text-xs ml-1">
                                  ({((asset.currentValue - asset.value) / asset.value * 100).toFixed(1)}%)
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {asset.appreciationRate && (
                            <div>
                              <div className="text-muted-foreground">Annual Rate</div>
                              <div className={`font-semibold ${
                                asset.appreciationRate >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {asset.appreciationRate >= 0 ? '+' : ''}{asset.appreciationRate.toFixed(1)}%
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {asset.description && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {asset.description}
                          </div>
                        )}
                      </div>
                      
                      {!readonly && (
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAsset(asset);
                              setShowAssetModal(true);
                            }}
                            title="Edit asset"
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this asset?')) {
                                deleteAsset(asset.id);
                              }
                            }}
                            title="Delete asset"
                            className="text-red-600 hover:text-red-700"
                          >
                            🗑️
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Asset Modal */}
      {showAssetModal && (
        <AssetModal
          isOpen={showAssetModal}
          onClose={() => {
            setShowAssetModal(false);
            setEditingAsset(null);
          }}
          onSave={editingAsset ? 
            (assetData) => updateAsset(editingAsset.id, assetData) : 
            addAsset
          }
          asset={editingAsset}
          isEditing={!!editingAsset}
          assetTypes={assetTypes}
        />
      )}
    </div>
  );
};

// Asset Modal Component
interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Omit<Asset, 'id'>) => void;
  asset?: Asset | null;
  isEditing?: boolean;
  assetTypes: any[];
}

const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  asset,
  isEditing = false,
  assetTypes
}) => {
  const [formData, setFormData] = useState<Omit<Asset, 'id'>>(() => ({
    name: asset?.name || '',
    type: asset?.type || 'other',
    value: asset?.value || 0,
    description: asset?.description || '',
    purchaseDate: asset?.purchaseDate || '',
    appreciationRate: asset?.appreciationRate || 0,
    maintenanceCost: asset?.maintenanceCost || 0,
    insuranceValue: asset?.insuranceValue || 0,
    notes: asset?.notes || '',
  }));

  const handleSubmit = () => {
    if (!formData.name.trim() || formData.value <= 0) {
      alert('Please fill in name and value');
      return;
    }
    
    onSave(formData);
  };

  const selectedAssetType = assetTypes.find(t => t.value === formData.type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Asset' : 'Add Asset'}
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <EditableText
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="Asset name"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Type *</label>
            <EditableSelect
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value as any })}
              options={assetTypes.map(type => ({
                value: type.value,
                label: `${type.icon} ${type.label}`
              }))}
              className="w-full"
            />
            {selectedAssetType && (
              <p className="text-xs text-muted-foreground">
                {selectedAssetType.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Value *</label>
            <EditableNumber
              value={formData.value}
              onChange={(value) => setFormData({ ...formData, value: value })}
              validation={creditAmountSchema}
              currency
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Purchase Date</label>
            <input
              type="date"
              value={formData.purchaseDate ? formData.purchaseDate.split('T')[0] : ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                purchaseDate: e.target.value ? e.target.value + 'T00:00:00.000Z' : ''
              })}
              className="w-full p-2 border border-border rounded-md"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Annual Appreciation Rate (%)</label>
            <EditableNumber
              value={formData.appreciationRate || 0}
              onChange={(value) => setFormData({ ...formData, appreciationRate: value })}
              min={-50}
              max={100}
              step={0.1}
              allowDecimals
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Positive for appreciation, negative for depreciation
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Annual Maintenance Cost</label>
            <EditableNumber
              value={formData.maintenanceCost || 0}
              onChange={(value) => setFormData({ ...formData, maintenanceCost: value })}
              validation={creditAmountSchema}
              currency
              className="w-full"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Insurance Value</label>
          <EditableNumber
            value={formData.insuranceValue || 0}
            onChange={(value) => setFormData({ ...formData, insuranceValue: value })}
            validation={creditAmountSchema}
            currency
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the asset..."
            rows={3}
            className="w-full p-2 border border-border rounded-md resize-none"
          />
        </div>
        
        {selectedAssetType && selectedAssetType.examples.length > 0 && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-sm font-medium mb-2">Examples of {selectedAssetType.label}:</div>
            <div className="text-sm text-muted-foreground">
              {selectedAssetType.examples.join(', ')}
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? 'Update' : 'Add'} Asset
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssetTracker;