import React, { useMemo } from 'react';
import type { CharacterFinances, CharacterSheetData, FinancialRecord } from '../../../../types/characterSheet';
import Card, { CardHeader, CardContent } from '../../../../../../shared/components/molecules/Card';

interface FinancialAnalyticsProps {
  finances: CharacterFinances;
  character: CharacterSheetData;
}

const FinancialAnalytics: React.FC<FinancialAnalyticsProps> = ({
  finances,
  character
}) => {
  // Calculate time-based analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Filter transactions by time period
    const last30Days = finances.transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
    const last90Days = finances.transactions.filter(t => new Date(t.date) >= ninetyDaysAgo);
    const lastYear = finances.transactions.filter(t => new Date(t.date) >= oneYearAgo);

    // Calculate totals for different periods
    const calculatePeriodTotals = (transactions: FinancialRecord[]) => {
      return transactions.reduce((acc, t) => {
        if (t.type === 'income') {
          acc.income += t.amount;
        } else if (t.type === 'expense') {
          acc.expenses += t.amount;
        }
        return acc;
      }, { income: 0, expenses: 0 });
    };

    const monthly = calculatePeriodTotals(last30Days);
    const quarterly = calculatePeriodTotals(last90Days);
    const yearly = calculatePeriodTotals(lastYear);

    // Category breakdown
    const categoryBreakdown = finances.transactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expenses: 0, count: 0 };
      }
      acc[t.category].count++;
      if (t.type === 'income') {
        acc[t.category].income += t.amount;
      } else if (t.type === 'expense') {
        acc[t.category].expenses += t.amount;
      }
      return acc;
    }, {} as Record<string, { income: number; expenses: number; count: number }>);

    // Monthly trends
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthTransactions = finances.transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthDate && tDate < nextMonth;
      });
      
      const monthTotals = calculatePeriodTotals(monthTransactions);
      
      monthlyTrends.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: monthTotals.income,
        expenses: monthTotals.expenses,
        net: monthTotals.income - monthTotals.expenses
      });
    }

    // Calculate averages
    const avgMonthlyIncome = yearly.income / 12;
    const avgMonthlyExpenses = yearly.expenses / 12;

    // Financial health metrics
    const liquidAssets = finances.currentCredits + finances.bankCredits;
    const totalAssetValue = finances.assets.reduce((sum, asset) => sum + asset.value, 0);
    const netWorth = liquidAssets + totalAssetValue - finances.debt;
    const debtToAssetRatio = totalAssetValue > 0 ? finances.debt / totalAssetValue : 0;
    const liquidityRatio = finances.monthlyExpenses > 0 ? liquidAssets / finances.monthlyExpenses : 0;

    // Spending velocity (how fast they spend money)
    const dailySpendingRate = last30Days.length > 0 
      ? last30Days.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) / 30
      : 0;
    
    const daysUntilBroke = liquidAssets > 0 && dailySpendingRate > 0
      ? Math.floor(liquidAssets / dailySpendingRate)
      : Infinity;

    return {
      periods: { monthly, quarterly, yearly },
      categoryBreakdown,
      monthlyTrends,
      averages: { income: avgMonthlyIncome, expenses: avgMonthlyExpenses },
      health: {
        netWorth,
        debtToAssetRatio,
        liquidityRatio,
        daysUntilBroke,
        dailySpendingRate
      }
    };
  }, [finances]);

  // Get financial health color
  const getHealthColor = (ratio: number, type: 'debt' | 'liquidity'): string => {
    if (type === 'debt') {
      if (ratio <= 0.3) return 'text-green-600';
      if (ratio <= 0.6) return 'text-yellow-600';
      return 'text-red-600';
    } else { // liquidity
      if (ratio >= 6) return 'text-green-600';
      if (ratio >= 3) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Calculate wealth percentile based on social standing
  const getWealthPercentile = (): { percentile: number; description: string } => {
    const socialStanding = character.characteristics.social;
    const netWorth = analytics.health.netWorth;
    
    // Traveller wealth guidelines by social standing
    const wealthThresholds = [
      { ss: 0, min: -50000, desc: "Destitute" },
      { ss: 1, min: -10000, desc: "Poor" },
      { ss: 2, min: 0, desc: "Lower class" },
      { ss: 6, min: 50000, desc: "Middle class" },
      { ss: 10, min: 500000, desc: "Upper class" },
      { ss: 12, min: 2000000, desc: "Wealthy" },
      { ss: 15, min: 10000000, desc: "Extremely wealthy" }
    ];
    
    const expectedThreshold = wealthThresholds.find(t => t.ss <= socialStanding) || wealthThresholds[0];
    const nextThreshold = wealthThresholds.find(t => t.ss > socialStanding);
    
    let percentile = 50; // Default
    let description = expectedThreshold.desc;
    
    if (netWorth >= expectedThreshold.min) {
      percentile = Math.min(90, 50 + (socialStanding * 5));
      if (nextThreshold && netWorth >= nextThreshold.min) {
        percentile = Math.min(95, percentile + 20);
        description = nextThreshold.desc;
      }
    } else {
      percentile = Math.max(10, 50 - ((expectedThreshold.min - netWorth) / expectedThreshold.min) * 40);
    }
    
    return { percentile: Math.round(percentile), description };
  };

  const wealthStatus = getWealthPercentile();

  return (
    <div className="space-y-6">
      {/* Financial Health Dashboard */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">💊 Financial Health</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                Cr{formatNumber(analytics.health.netWorth)}
              </div>
              <div className="text-sm text-purple-600">Net Worth</div>
              <div className="text-xs text-muted-foreground mt-1">
                {wealthStatus.percentile}th percentile - {wealthStatus.description}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
              <div className={`text-2xl font-bold ${getHealthColor(analytics.health.liquidityRatio, 'liquidity')}`}>
                {analytics.health.liquidityRatio.toFixed(1)}x
              </div>
              <div className="text-sm text-blue-600">Liquidity Ratio</div>
              <div className="text-xs text-muted-foreground mt-1">
                Months of expenses covered
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
              <div className={`text-2xl font-bold ${getHealthColor(analytics.health.debtToAssetRatio, 'debt')}`}>
                {(analytics.health.debtToAssetRatio * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-orange-600">Debt Ratio</div>
              <div className="text-xs text-muted-foreground mt-1">
                Debt to assets
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg">
              <div className={`text-2xl font-bold ${
                analytics.health.daysUntilBroke === Infinity ? 'text-green-700' :
                analytics.health.daysUntilBroke > 90 ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {analytics.health.daysUntilBroke === Infinity ? '∞' : analytics.health.daysUntilBroke}
              </div>
              <div className="text-sm text-red-600">
                {analytics.health.daysUntilBroke === Infinity ? 'Sustainable' : 'Days Left'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                At current spending rate
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">📅 Last 30 Days</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-600">Income:</span>
                <span className="font-mono">Cr{analytics.periods.monthly.income.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Expenses:</span>
                <span className="font-mono">Cr{analytics.periods.monthly.expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Net:</span>
                <span className={`font-mono font-semibold ${
                  analytics.periods.monthly.income - analytics.periods.monthly.expenses >= 0 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  Cr{(analytics.periods.monthly.income - analytics.periods.monthly.expenses).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">📈 Last 90 Days</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-600">Income:</span>
                <span className="font-mono">Cr{analytics.periods.quarterly.income.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Expenses:</span>
                <span className="font-mono">Cr{analytics.periods.quarterly.expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Net:</span>
                <span className={`font-mono font-semibold ${
                  analytics.periods.quarterly.income - analytics.periods.quarterly.expenses >= 0 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  Cr{(analytics.periods.quarterly.income - analytics.periods.quarterly.expenses).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">📊 Last Year</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-600">Income:</span>
                <span className="font-mono">Cr{analytics.periods.yearly.income.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Expenses:</span>
                <span className="font-mono">Cr{analytics.periods.yearly.expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Net:</span>
                <span className={`font-mono font-semibold ${
                  analytics.periods.yearly.income - analytics.periods.yearly.expenses >= 0 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  Cr{(analytics.periods.yearly.income - analytics.periods.yearly.expenses).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">📈 Monthly Trends</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple text-based chart */}
            <div className="overflow-x-auto">
              <div className="min-w-full space-y-2">
                {analytics.monthlyTrends.map((month, index) => {
                  const maxAmount = Math.max(
                    ...analytics.monthlyTrends.map(m => Math.max(m.income, m.expenses))
                  );
                  const incomeWidth = maxAmount > 0 ? (month.income / maxAmount) * 100 : 0;
                  const expenseWidth = maxAmount > 0 ? (month.expenses / maxAmount) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex items-center gap-4 text-sm">
                      <div className="w-16 text-right font-mono text-xs">
                        {month.month}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Income bar */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-16 text-right text-xs text-green-600">
                            Cr{formatNumber(month.income)}
                          </div>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${incomeWidth}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Expense bar */}
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-right text-xs text-red-600">
                            Cr{formatNumber(month.expenses)}
                          </div>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${expenseWidth}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className={`w-20 text-right font-mono text-xs ${
                        month.net >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {month.net >= 0 ? '+' : ''}Cr{formatNumber(month.net)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">🏷️ Spending by Category</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.categoryBreakdown)
              .sort(([,a], [,b]) => (b.expenses + b.income) - (a.expenses + a.income))
              .map(([category, data]) => {
                const total = data.expenses + data.income;
                const maxTotal = Math.max(
                  ...Object.values(analytics.categoryBreakdown).map(d => d.expenses + d.income)
                );
                const width = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{category}</span>
                      <span className="text-sm text-muted-foreground">
                        {data.count} transaction{data.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-right text-green-600">
                          +{formatNumber(data.income)}
                        </span>
                        <div className="flex-1 bg-green-100 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-right text-red-600">
                          -{formatNumber(data.expenses)}
                        </span>
                        <div className="flex-1 bg-red-100 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Financial Recommendations */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">💡 Financial Recommendations</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.health.liquidityRatio < 3 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="font-medium text-yellow-800">🚨 Low Emergency Fund</div>
                <div className="text-sm text-yellow-700 mt-1">
                  Consider building an emergency fund to cover 3-6 months of expenses. 
                  You currently have {analytics.health.liquidityRatio.toFixed(1)} months covered.
                </div>
              </div>
            )}
            
            {analytics.health.debtToAssetRatio > 0.6 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-medium text-red-800">⚠️ High Debt Load</div>
                <div className="text-sm text-red-700 mt-1">
                  Your debt represents {(analytics.health.debtToAssetRatio * 100).toFixed(1)}% of your assets. 
                  Consider focusing on debt reduction.
                </div>
              </div>
            )}
            
            {analytics.periods.monthly.expenses > analytics.periods.monthly.income && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-medium text-red-800">📉 Spending More Than Earning</div>
                <div className="text-sm text-red-700 mt-1">
                  Your monthly expenses exceed your income. Review your spending habits and consider 
                  ways to increase income or reduce expenses.
                </div>
              </div>
            )}
            
            {analytics.health.netWorth > 0 && analytics.health.liquidityRatio > 6 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800">✅ Strong Financial Position</div>
                <div className="text-sm text-green-700 mt-1">
                  Your financial health looks good! Consider investing excess cash or 
                  upgrading equipment to improve your earning potential.
                </div>
              </div>
            )}
            
            {analytics.averages.income > 0 && analytics.averages.expenses === 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium text-blue-800">📊 Track Your Expenses</div>
                <div className="text-sm text-blue-700 mt-1">
                  You're earning credits but not tracking expenses. Consider logging your 
                  spending to better understand your financial patterns.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialAnalytics;