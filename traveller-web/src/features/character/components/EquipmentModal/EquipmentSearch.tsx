import React, { useState, useMemo } from 'react';
import type { 
  CharacterSheetEquipment, 
  EquipmentCategory, 
  EquipmentLocation,
  EquipmentCondition 
} from '../../types/characterSheet';
import { getEquipmentCategoryIcon, getEquipmentLocationIcon } from '../../types/characterSheet';
import Input from '../../../../shared/components/atoms/Input';
import Button from '../../../../shared/components/atoms/Button';

interface EquipmentSearchProps {
  equipment: CharacterSheetEquipment[];
  onFilter: (filtered: CharacterSheetEquipment[]) => void;
  searchPlaceholder?: string;
}

interface FilterState {
  searchTerm: string;
  categories: Set<EquipmentCategory>;
  locations: Set<EquipmentLocation>;
  conditions: Set<EquipmentCondition>;
  techLevelMin?: number;
  techLevelMax?: number;
  weightMin?: number;
  weightMax?: number;
  costMin?: number;
  costMax?: number;
  showBroken: boolean;
  showCustomOnly: boolean;
  hasEffects: boolean;
}

const EquipmentSearch: React.FC<EquipmentSearchProps> = ({
  equipment,
  onFilter,
  searchPlaceholder = "Search equipment..."
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    categories: new Set(),
    locations: new Set(),
    conditions: new Set(),
    showBroken: true,
    showCustomOnly: false,
    hasEffects: false
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get available filter options from current equipment
  const filterOptions = useMemo(() => {
    const categories = new Set<EquipmentCategory>();
    const locations = new Set<EquipmentLocation>();
    const conditions = new Set<EquipmentCondition>();
    let minTechLevel = 20, maxTechLevel = 0;
    let minWeight = Infinity, maxWeight = 0;
    let minCost = Infinity, maxCost = 0;

    equipment.forEach(item => {
      categories.add(item.category);
      locations.add(item.location);
      conditions.add(item.condition);
      
      minTechLevel = Math.min(minTechLevel, item.techLevel);
      maxTechLevel = Math.max(maxTechLevel, item.techLevel);
      
      minWeight = Math.min(minWeight, item.weight);
      maxWeight = Math.max(maxWeight, item.weight);
      
      minCost = Math.min(minCost, item.cost);
      maxCost = Math.max(maxCost, item.cost);
    });

    return {
      categories: Array.from(categories).sort(),
      locations: Array.from(locations).sort(),
      conditions: Array.from(conditions).sort(),
      techLevel: { min: minTechLevel === 20 ? 0 : minTechLevel, max: maxTechLevel },
      weight: { min: minWeight === Infinity ? 0 : minWeight, max: maxWeight },
      cost: { min: minCost === Infinity ? 0 : minCost, max: maxCost }
    };
  }, [equipment]);

  // Apply filters to equipment
  const filteredEquipment = useMemo(() => {
    let filtered = equipment;

    // Text search
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.notes?.toLowerCase().includes(searchLower) ||
        item.traits?.some(trait => trait.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filters.categories.size > 0) {
      filtered = filtered.filter(item => filters.categories.has(item.category));
    }

    // Location filter
    if (filters.locations.size > 0) {
      filtered = filtered.filter(item => filters.locations.has(item.location));
    }

    // Condition filter
    if (filters.conditions.size > 0) {
      filtered = filtered.filter(item => filters.conditions.has(item.condition));
    }

    // Tech level range
    if (filters.techLevelMin !== undefined) {
      filtered = filtered.filter(item => item.techLevel >= filters.techLevelMin!);
    }
    if (filters.techLevelMax !== undefined) {
      filtered = filtered.filter(item => item.techLevel <= filters.techLevelMax!);
    }

    // Weight range
    if (filters.weightMin !== undefined) {
      filtered = filtered.filter(item => item.weight >= filters.weightMin!);
    }
    if (filters.weightMax !== undefined) {
      filtered = filtered.filter(item => item.weight <= filters.weightMax!);
    }

    // Cost range
    if (filters.costMin !== undefined) {
      filtered = filtered.filter(item => item.cost >= filters.costMin!);
    }
    if (filters.costMax !== undefined) {
      filtered = filtered.filter(item => item.cost <= filters.costMax!);
    }

    // Broken items
    if (!filters.showBroken) {
      filtered = filtered.filter(item => item.condition !== 'broken');
    }

    // Custom items only
    if (filters.showCustomOnly) {
      filtered = filtered.filter(item => item.isCustom);
    }

    // Has effects
    if (filters.hasEffects) {
      filtered = filtered.filter(item => item.effects && item.effects.length > 0);
    }

    return filtered;
  }, [equipment, filters]);

  // Update parent component when filters change
  React.useEffect(() => {
    onFilter(filteredEquipment);
  }, [filteredEquipment, onFilter]);

  const updateFilter = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const toggleCategory = (category: EquipmentCategory) => {
    const newCategories = new Set(filters.categories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    updateFilter({ categories: newCategories });
  };

  const toggleLocation = (location: EquipmentLocation) => {
    const newLocations = new Set(filters.locations);
    if (newLocations.has(location)) {
      newLocations.delete(location);
    } else {
      newLocations.add(location);
    }
    updateFilter({ locations: newLocations });
  };

  const toggleCondition = (condition: EquipmentCondition) => {
    const newConditions = new Set(filters.conditions);
    if (newConditions.has(condition)) {
      newConditions.delete(condition);
    } else {
      newConditions.add(condition);
    }
    updateFilter({ conditions: newConditions });
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      categories: new Set(),
      locations: new Set(),
      conditions: new Set(),
      showBroken: true,
      showCustomOnly: false,
      hasEffects: false
    });
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.categories.size > 0 || 
    filters.locations.size > 0 || 
    filters.conditions.size > 0 ||
    filters.techLevelMin !== undefined ||
    filters.techLevelMax !== undefined ||
    filters.weightMin !== undefined ||
    filters.weightMax !== undefined ||
    filters.costMin !== undefined ||
    filters.costMax !== undefined ||
    !filters.showBroken ||
    filters.showCustomOnly ||
    filters.hasEffects;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={filters.searchTerm}
            onChange={(e) => updateFilter({ searchTerm: e.target.value })}
            className="w-full"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide' : 'Advanced'}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredEquipment.length} of {equipment.length} items
        {hasActiveFilters && ' (filtered)'}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          {/* Category Filter */}
          <div>
            <h4 className="font-medium mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.categories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.categories.has(category)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-accent'
                  }`}
                >
                  <span>{getEquipmentCategoryIcon(category)}</span>
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <h4 className="font-medium mb-2">Locations</h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.locations.map(location => (
                <button
                  key={location}
                  onClick={() => toggleLocation(location)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                    filters.locations.has(location)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-accent'
                  }`}
                >
                  <span>{getEquipmentLocationIcon(location)}</span>
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div>
            <h4 className="font-medium mb-2">Conditions</h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.conditions.map(condition => (
                <button
                  key={condition}
                  onClick={() => toggleCondition(condition)}
                  className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                    filters.conditions.has(condition)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-accent'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          {/* Numeric Ranges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tech Level */}
            <div>
              <h4 className="font-medium mb-2">Tech Level</h4>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.techLevelMin ?? ''}
                  onChange={(e) => updateFilter({ 
                    techLevelMin: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  min={filterOptions.techLevel.min}
                  max={filterOptions.techLevel.max}
                  className="text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.techLevelMax ?? ''}
                  onChange={(e) => updateFilter({ 
                    techLevelMax: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  min={filterOptions.techLevel.min}
                  max={filterOptions.techLevel.max}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Weight */}
            <div>
              <h4 className="font-medium mb-2">Weight (kg)</h4>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Min"
                  value={filters.weightMin ?? ''}
                  onChange={(e) => updateFilter({ 
                    weightMin: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  min={0}
                  className="text-sm"
                />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Max"
                  value={filters.weightMax ?? ''}
                  onChange={(e) => updateFilter({ 
                    weightMax: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  min={0}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Cost */}
            <div>
              <h4 className="font-medium mb-2">Cost (Cr)</h4>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.costMin ?? ''}
                  onChange={(e) => updateFilter({ 
                    costMin: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  min={0}
                  className="text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.costMax ?? ''}
                  onChange={(e) => updateFilter({ 
                    costMax: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  min={0}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.showBroken}
                onChange={(e) => updateFilter({ showBroken: e.target.checked })}
              />
              <span className="text-sm">Show broken items</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.showCustomOnly}
                onChange={(e) => updateFilter({ showCustomOnly: e.target.checked })}
              />
              <span className="text-sm">Custom items only</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.hasEffects}
                onChange={(e) => updateFilter({ hasEffects: e.target.checked })}
              />
              <span className="text-sm">Items with effects only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentSearch;