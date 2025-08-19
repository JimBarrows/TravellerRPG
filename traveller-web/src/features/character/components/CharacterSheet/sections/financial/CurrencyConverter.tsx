import React, { useState, useMemo } from 'react';
import type { CharacterSheetData } from '../../../../types/characterSheet';
import Card, { CardHeader, CardContent } from '../../../../../../shared/components/molecules/Card';
import { EditableNumber, EditableSelect } from '../../../EditableFields';

interface CurrencyConverterProps {
  currentCredits: number;
  character: CharacterSheetData;
}

interface Currency {
  code: string;
  name: string;
  description: string;
  icon: string;
  rateToCredits: number; // How many credits = 1 unit of this currency
  worldTypes: string[];
  techLevel: number[];
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare';
  notes?: string;
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  spread: number; // Bank/exchange spread percentage
  lastUpdated: string;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  currentCredits,
  character
}) => {
  const [amount, setAmount] = useState(1000);
  const [fromCurrency, setFromCurrency] = useState('IMP');
  const [toCurrency, setToCurrency] = useState('SOL');
  const [includeSpread, setIncludeSpread] = useState(true);
  const [selectedWorld, setSelectedWorld] = useState('standard');

  // Traveller RPG currencies and exchange rates
  const currencies: Currency[] = [
    {
      code: 'IMP',
      name: 'Imperial Credits',
      description: 'Standard Imperial currency',
      icon: '⭐',
      rateToCredits: 1.0,
      worldTypes: ['all'],
      techLevel: [0, 15],
      rarity: 'common',
      notes: 'Universal standard throughout the Third Imperium'
    },
    {
      code: 'SOL',
      name: 'Solar Credits',
      description: 'Solomani Confederation currency',
      icon: '☀️',
      rateToCredits: 0.95,
      worldTypes: ['solomani', 'terra'],
      techLevel: [8, 15],
      rarity: 'common',
      notes: 'Primary currency in Solomani space'
    },
    {
      code: 'ZHO',
      name: 'Zhodani Credits',
      description: 'Zhodani Consulate currency',
      icon: '🧠',
      rateToCredits: 1.15,
      worldTypes: ['zhodani', 'psionic'],
      techLevel: [10, 15],
      rarity: 'uncommon',
      notes: 'Used in Zhodani Consulate territories'
    },
    {
      code: 'ASL',
      name: 'Aslan Tokens',
      description: 'Aslan Hierate currency',
      icon: '🦁',
      rateToCredits: 0.85,
      worldTypes: ['aslan', 'clan'],
      techLevel: [7, 14],
      rarity: 'uncommon',
      notes: 'Honor-based currency system'
    },
    {
      code: 'VAR',
      name: 'Vargr Packs',
      description: 'Vargr Extents trade units',
      icon: '🐺',
      rateToCredits: 0.75,
      worldTypes: ['vargr', 'pack'],
      techLevel: [6, 13],
      rarity: 'uncommon',
      notes: 'Fluctuates with pack politics'
    },
    {
      code: 'HIV',
      name: 'Hiver Credits',
      description: 'Hiver Federation currency',
      icon: '🕷️',
      rateToCredits: 1.35,
      worldTypes: ['hiver', 'manipulation'],
      techLevel: [12, 16],
      rarity: 'rare',
      notes: 'Complex manipulation-based system'
    },
    {
      code: 'K\'K',
      name: 'K\'kree Herd Units',
      description: 'K\'kree herd-based currency',
      icon: '🦌',
      rateToCredits: 0.65,
      worldTypes: ['kkree', 'herd'],
      techLevel: [8, 14],
      rarity: 'rare',
      notes: 'Based on herd productivity'
    },
    {
      code: 'DRO',
      name: 'Droyne Credits',
      description: 'Ancient Droyne currency',
      icon: '🦋',
      rateToCredits: 2.5,
      worldTypes: ['droyne', 'ancient'],
      techLevel: [5, 18],
      rarity: 'very_rare',
      notes: 'Rare ancient currency, highly valued'
    },
    {
      code: 'LOC',
      name: 'Local Currency',
      description: 'World-specific currency',
      icon: '🏛️',
      rateToCredits: 1.0,
      worldTypes: ['independent', 'frontier'],
      techLevel: [3, 12],
      rarity: 'common',
      notes: 'Varies by world and local government'
    },
    {
      code: 'BTC',
      name: 'Barter Trade Credits',
      description: 'Trade goods valuation',
      icon: '🔄',
      rateToCredits: 0.8,
      worldTypes: ['frontier', 'low-tech'],
      techLevel: [0, 8],
      rarity: 'uncommon',
      notes: 'Based on actual trade goods value'
    }
  ];

  // World type modifiers
  const worldTypeModifiers = {
    'high-tech': { modifier: 1.2, description: 'High-tech worlds have strong currencies' },
    'industrial': { modifier: 1.1, description: 'Industrial worlds have stable currencies' },
    'standard': { modifier: 1.0, description: 'Standard worlds use baseline rates' },
    'agricultural': { modifier: 0.95, description: 'Agricultural worlds have slightly weaker currencies' },
    'frontier': { modifier: 0.85, description: 'Frontier worlds have volatile currencies' },
    'low-tech': { modifier: 0.7, description: 'Low-tech worlds have less stable currencies' },
    'war-torn': { modifier: 0.6, description: 'War-torn worlds have severely devalued currencies' },
    'independent': { modifier: 0.9, description: 'Independent worlds have local currency variations' }
  };

  // Exchange spreads (bank fees)
  const exchangeSpreads = {
    common: 0.02,      // 2% spread
    uncommon: 0.05,    // 5% spread  
    rare: 0.10,        // 10% spread
    very_rare: 0.20    // 20% spread
  };

  // Calculate effective exchange rate
  const calculateExchangeRate = useMemo(() => {
    const fromCurr = currencies.find(c => c.code === fromCurrency);
    const toCurr = currencies.find(c => c.code === toCurrency);
    
    if (!fromCurr || !toCurr) return 0;
    
    // Base rate conversion through Imperial Credits
    let rate = fromCurr.rateToCredits / toCurr.rateToCredits;
    
    // Apply world type modifier
    const worldMod = worldTypeModifiers[selectedWorld as keyof typeof worldTypeModifiers];
    if (worldMod) {
      rate *= worldMod.modifier;
    }
    
    // Apply spread if enabled
    if (includeSpread) {
      const spread = Math.max(
        exchangeSpreads[fromCurr.rarity],
        exchangeSpreads[toCurr.rarity]
      );
      rate *= (1 - spread);
    }
    
    return rate;
  }, [fromCurrency, toCurrency, selectedWorld, includeSpread]);

  // Calculate conversion
  const convertedAmount = useMemo(() => {
    return amount * calculateExchangeRate;
  }, [amount, calculateExchangeRate]);

  // Get currency info
  const fromCurrencyInfo = currencies.find(c => c.code === fromCurrency);
  const toCurrencyInfo = currencies.find(c => c.code === toCurrency);

  // Calculate purchasing power
  const calculatePurchasingPower = (amount: number, currencyCode: string): string[] => {
    const currency = currencies.find(c => c.code === currencyCode);
    if (!currency) return [];
    
    // Convert to Imperial Credits for standardized pricing
    const creditsValue = amount * currency.rateToCredits;
    
    const items = [
      { name: 'Basic meal', cost: 10, category: 'food' },
      { name: 'Night at inn', cost: 50, category: 'accommodation' },
      { name: 'Starport fee', cost: 100, category: 'transport' },
      { name: 'Jumpship passage', cost: 1000, category: 'transport' },
      { name: 'Vacc suit', cost: 10000, category: 'equipment' },
      { name: 'Air/Raft', cost: 275000, category: 'vehicle' },
      { name: 'Scout ship', cost: 25000000, category: 'ship' }
    ];
    
    return items
      .filter(item => creditsValue >= item.cost)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5)
      .map(item => `${Math.floor(creditsValue / item.cost)}× ${item.name}`);
  };

  const purchasingPower = calculatePurchasingPower(convertedAmount, toCurrency);

  // Historical rates simulation
  const getMarketTrend = (currency: Currency): { trend: 'up' | 'down' | 'stable'; change: number } => {
    // Simulate market trends based on currency characteristics
    const hash = currency.code.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const variation = (hash % 20 - 10) / 100; // -10% to +10%
    
    if (Math.abs(variation) < 0.02) return { trend: 'stable', change: variation };
    return { trend: variation > 0 ? 'up' : 'down', change: variation };
  };

  const fromTrend = fromCurrencyInfo ? getMarketTrend(fromCurrencyInfo) : null;
  const toTrend = toCurrencyInfo ? getMarketTrend(toCurrencyInfo) : null;

  return (
    <div className="space-y-6">
      {/* Exchange Rate Calculator */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">💱 Currency Exchange Calculator</h3>
          <p className="text-sm text-muted-foreground">
            Convert between different currency systems across known space
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* World Context */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Exchange Location</label>
              <EditableSelect
                value={selectedWorld}
                onChange={setSelectedWorld}
                options={Object.entries(worldTypeModifiers).map(([key, value]) => ({
                  value: key,
                  label: `${key.charAt(0).toUpperCase() + key.slice(1)} World (${value.modifier}×)`
                }))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                {worldTypeModifiers[selectedWorld as keyof typeof worldTypeModifiers]?.description}
              </p>
            </div>
            
            {/* Exchange Settings */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeSpread"
                checked={includeSpread}
                onChange={(e) => setIncludeSpread(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="includeSpread" className="text-sm">
                Include bank/exchange fees
              </label>
            </div>
            
            {/* Currency Conversion */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Currency</label>
                <EditableSelect
                  value={fromCurrency}
                  onChange={setFromCurrency}
                  options={currencies.map(curr => ({
                    value: curr.code,
                    label: `${curr.icon} ${curr.code} - ${curr.name}`
                  }))}
                  className="w-full"
                />
                {fromCurrencyInfo && (
                  <div className="text-xs text-muted-foreground">
                    {fromCurrencyInfo.description}
                    {fromTrend && (
                      <span className={`ml-2 ${
                        fromTrend.trend === 'up' ? 'text-green-600' : 
                        fromTrend.trend === 'down' ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {fromTrend.trend === 'up' ? '📈' : fromTrend.trend === 'down' ? '📉' : '➡️'}
                        {fromTrend.change >= 0 ? '+' : ''}{(fromTrend.change * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <EditableNumber
                  value={amount}
                  onChange={setAmount}
                  min={0}
                  allowDecimals
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">To Currency</label>
                <EditableSelect
                  value={toCurrency}
                  onChange={setToCurrency}
                  options={currencies.map(curr => ({
                    value: curr.code,
                    label: `${curr.icon} ${curr.code} - ${curr.name}`
                  }))}
                  className="w-full"
                />
                {toCurrencyInfo && (
                  <div className="text-xs text-muted-foreground">
                    {toCurrencyInfo.description}
                    {toTrend && (
                      <span className={`ml-2 ${
                        toTrend.trend === 'up' ? 'text-green-600' : 
                        toTrend.trend === 'down' ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {toTrend.trend === 'up' ? '📈' : toTrend.trend === 'down' ? '📉' : '➡️'}
                        {toTrend.change >= 0 ? '+' : ''}{(toTrend.change * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Conversion Result */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Exchange Result</div>
                <div className="text-3xl font-bold">
                  {fromCurrencyInfo?.icon} {amount.toLocaleString()} {fromCurrency}
                  <span className="mx-4 text-muted-foreground">→</span>
                  {toCurrencyInfo?.icon} {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {toCurrency}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Exchange rate: 1 {fromCurrency} = {calculateExchangeRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toCurrency}
                </div>
              </div>
            </div>
            
            {/* Your Current Credits */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Your Current Credits:</span>
                <span className="font-mono">Cr{currentCredits.toLocaleString()}</span>
              </div>
              {fromCurrency === 'IMP' && (
                <div className="text-sm text-muted-foreground mt-1">
                  = {toCurrencyInfo?.icon} {(currentCredits * calculateExchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 })} {toCurrency}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchasing Power Analysis */}
      {purchasingPower.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">💰 Purchasing Power</h3>
            <p className="text-sm text-muted-foreground">
              What you can buy with {convertedAmount.toLocaleString()} {toCurrency}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {purchasingPower.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Currency Reference Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">📊 Currency Reference</h3>
          <p className="text-sm text-muted-foreground">
            Exchange rates relative to Imperial Credits
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2">Currency</th>
                  <th className="text-left p-2">Rate</th>
                  <th className="text-left p-2">Rarity</th>
                  <th className="text-left p-2">Tech Level</th>
                  <th className="text-left p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {currencies.map((currency) => (
                  <tr key={currency.code} className="border-b border-border hover:bg-muted/30">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{currency.icon}</span>
                        <div>
                          <div className="font-medium">{currency.code}</div>
                          <div className="text-xs text-muted-foreground">{currency.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 font-mono">
                      {currency.rateToCredits.toFixed(2)} Cr
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        currency.rarity === 'common' ? 'bg-green-100 text-green-700' :
                        currency.rarity === 'uncommon' ? 'bg-yellow-100 text-yellow-700' :
                        currency.rarity === 'rare' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {currency.rarity}
                      </span>
                    </td>
                    <td className="p-2">
                      TL{currency.techLevel[0]}-{currency.techLevel[1]}
                    </td>
                    <td className="p-2 text-muted-foreground">
                      {currency.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Tips */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">💡 Exchange Tips</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">🏦 Best Exchange Rates</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Major starports have competitive rates</li>
                <li>• Imperial banks offer standard rates</li>
                <li>• Avoid frontier world exchanges</li>
                <li>• Corporate credits may have restrictions</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">⚠️ Exchange Risks</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Political instability affects rates</li>
                <li>• War zones have volatile currencies</li>
                <li>• Local currencies may not be accepted off-world</li>
                <li>• Some currencies require special licenses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencyConverter;