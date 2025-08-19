import React, { useState, useMemo } from 'react';
import type { CharacterSheetSectionProps, FinancialRecord } from '../../../types/characterSheet';
import { creditAmountSchema, transactionTypeSchema } from '../../../validation/schemas';
import Card, { CardHeader, CardContent } from '../../../../../shared/components/molecules/Card';
import Button from '../../../../../shared/components/atoms/Button';
import Modal from '../../../../../shared/components/molecules/Modal';
import { EditableNumber, EditableText, EditableSelect } from '../../EditableFields';
import TransactionHistory from './financial/TransactionHistory';
import RecurringPayments from './financial/RecurringPayments';
import FinancialAnalytics from './financial/FinancialAnalytics';
import AssetTracker from './financial/AssetTracker';
import CurrencyConverter from './financial/CurrencyConverter';

const CharacterFinances = ({ character, onUpdate, readonly }: CharacterSheetSectionProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'recurring' | 'analytics' | 'assets' | 'converter'>('overview');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialRecord | null>(null);
  
  const finances = character.finances;
  
  // Calculate derived financial metrics
  const netWorth = useMemo(() => {
    const liquidWealth = finances.currentCredits + finances.bankCredits - finances.debt;
    const assetValue = finances.assets.reduce((sum, asset) => sum + asset.value, 0);
    return liquidWealth + assetValue;
  }, [finances.currentCredits, finances.bankCredits, finances.debt, finances.assets]);
  
  const monthlyNetIncome = useMemo(() => {
    return finances.monthlyIncome - finances.monthlyExpenses;
  }, [finances.monthlyIncome, finances.monthlyExpenses]);
  
  // Update financial data
  const updateFinances = (updates: Partial<typeof finances>) => {
    onUpdate({
      finances: {
        ...finances,
        ...updates
      }
    });
  };
  
  // Add new transaction
  const addTransaction = (transaction: Omit<FinancialRecord, 'id'>) => {
    const newTransaction: FinancialRecord = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    
    const updatedTransactions = [...finances.transactions, newTransaction];
    
    // Update account balances based on transaction type
    let updates: Partial<typeof finances> = {
      transactions: updatedTransactions
    };
    
    if (transaction.type === 'income') {
      updates.currentCredits = finances.currentCredits + transaction.amount;
    } else if (transaction.type === 'expense') {
      updates.currentCredits = finances.currentCredits - transaction.amount;
    }
    
    updateFinances(updates);
    setShowTransactionModal(false);
  };
  
  // Update existing transaction
  const updateTransaction = (id: string, updates: Partial<FinancialRecord>) => {
    const updatedTransactions = finances.transactions.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    
    updateFinances({ transactions: updatedTransactions });
    setEditingTransaction(null);
  };
  
  // Delete transaction
  const deleteTransaction = (id: string) => {
    const transaction = finances.transactions.find(t => t.id === id);
    if (!transaction) return;
    
    const updatedTransactions = finances.transactions.filter(t => t.id !== id);
    
    // Reverse the transaction's effect on balances
    let updates: Partial<typeof finances> = {
      transactions: updatedTransactions
    };
    
    if (transaction.type === 'income') {
      updates.currentCredits = finances.currentCredits - transaction.amount;
    } else if (transaction.type === 'expense') {
      updates.currentCredits = finances.currentCredits + transaction.amount;
    }
    
    updateFinances(updates);
  };
  
  // Navigation tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '💰' },
    { id: 'transactions', label: 'Transactions', icon: '📊', badge: finances.transactions.length },
    { id: 'recurring', label: 'Recurring', icon: '🔄' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'assets', label: 'Assets', icon: '🏦', badge: finances.assets.length },
    { id: 'converter', label: 'Currency', icon: '💱' },
  ];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <EditableNumber
                  value={finances.currentCredits}
                  onChange={(value) => updateFinances({ currentCredits: value })}
                  validation={creditAmountSchema}
                  currency
                  readonly={readonly}
                  className="text-2xl font-bold text-green-700 bg-transparent border-none text-center"
                />
                <div className="text-sm text-green-600 mt-1">Cash on Hand</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <EditableNumber
                  value={finances.bankCredits}
                  onChange={(value) => updateFinances({ bankCredits: value })}
                  validation={creditAmountSchema}
                  currency
                  readonly={readonly}
                  className="text-2xl font-bold text-blue-700 bg-transparent border-none text-center"
                />
                <div className="text-sm text-blue-600 mt-1">Bank Account</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <EditableNumber
                  value={finances.debt}
                  onChange={(value) => updateFinances({ debt: value })}
                  validation={creditAmountSchema}
                  currency
                  readonly={readonly}
                  className="text-2xl font-bold text-red-700 bg-transparent border-none text-center"
                />
                <div className="text-sm text-red-600 mt-1">Outstanding Debt</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className={`text-2xl font-bold ${
                  netWorth >= 0 ? 'text-purple-700' : 'text-red-700'
                }`}>
                  Cr{netWorth.toLocaleString()}
                </div>
                <div className="text-sm text-purple-600 mt-1">Net Worth</div>
              </div>
            </div>
            
            {/* Monthly Cash Flow */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Monthly Cash Flow</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-700">Monthly Income</label>
                    <EditableNumber
                      value={finances.monthlyIncome}
                      onChange={(value) => updateFinances({ monthlyIncome: value })}
                      validation={creditAmountSchema}
                      currency
                      readonly={readonly}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-red-700">Monthly Expenses</label>
                    <EditableNumber
                      value={finances.monthlyExpenses}
                      onChange={(value) => updateFinances({ monthlyExpenses: value })}
                      validation={creditAmountSchema}
                      currency
                      readonly={readonly}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Net Monthly</label>
                    <div className={`p-3 rounded-lg text-center font-semibold ${
                      monthlyNetIncome >= 0 
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      Cr{monthlyNetIncome.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            {!readonly && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTransactionModal(true)}
                    >
                      ➕ Add Transaction
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('recurring')}
                    >
                      🔄 Manage Recurring Payments
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('assets')}
                    >
                      🏦 Manage Assets
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('analytics')}
                    >
                      📈 View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
        
      case 'transactions':
        return (
          <TransactionHistory
            transactions={finances.transactions}
            onAddTransaction={() => setShowTransactionModal(true)}
            onEditTransaction={setEditingTransaction}
            onDeleteTransaction={deleteTransaction}
            readonly={readonly}
          />
        );
        
      case 'recurring':
        return (
          <RecurringPayments
            character={character}
            onUpdate={onUpdate}
            readonly={readonly}
          />
        );
        
      case 'analytics':
        return (
          <FinancialAnalytics
            finances={finances}
            character={character}
          />
        );
        
      case 'assets':
        return (
          <AssetTracker
            assets={finances.assets}
            onUpdateAssets={(assets) => updateFinances({ assets })}
            readonly={readonly}
          />
        );
        
      case 'converter':
        return (
          <CurrencyConverter
            currentCredits={finances.currentCredits}
            character={character}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
      
      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          onSave={addTransaction}
          transaction={editingTransaction}
        />
      )}
      
      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <TransactionModal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={(transaction) => updateTransaction(editingTransaction.id, transaction)}
          transaction={editingTransaction}
          isEditing
        />
      )}
    </div>
  );
};

// Transaction Modal Component
interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<FinancialRecord, 'id'> | Partial<FinancialRecord>) => void;
  transaction?: FinancialRecord | null;
  isEditing?: boolean;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  transaction, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState<Omit<FinancialRecord, 'id'>>(() => ({
    type: transaction?.type || 'expense',
    amount: transaction?.amount || 0,
    description: transaction?.description || '',
    category: transaction?.category || '',
    date: transaction?.date || new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
    relatedTo: transaction?.relatedTo || '',
  }));
  
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  
  const validateForm = () => {
    const newErrors: Record<string, string[]> = {};
    
    // Validate amount
    const amountResult = creditAmountSchema.safeParse(formData.amount);
    if (!amountResult.success) {
      newErrors.amount = amountResult.error.errors.map(e => e.message);
    }
    
    // Validate type
    const typeResult = transactionTypeSchema.safeParse(formData.type);
    if (!typeResult.success) {
      newErrors.type = typeResult.error.errors.map(e => e.message);
    }
    
    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = ['Description is required'];
    }
    
    // Validate category
    if (!formData.category.trim()) {
      newErrors.category = ['Category is required'];
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Add Transaction'}
      size="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type *</label>
            <EditableSelect
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value as any })}
              options={[
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
                { value: 'transfer', label: 'Transfer' },
                { value: 'adjustment', label: 'Adjustment' },
              ]}
              className="w-full"
            />
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type[0]}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount *</label>
            <EditableNumber
              value={formData.amount}
              onChange={(value) => setFormData({ ...formData, amount: value })}
              validation={creditAmountSchema}
              currency
              className="w-full"
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount[0]}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Description *</label>
          <EditableText
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Enter transaction description..."
            className="w-full"
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description[0]}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Category *</label>
          <EditableSelect
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value })}
            options={[
              { value: 'salary', label: 'Salary' },
              { value: 'trading', label: 'Trading' },
              { value: 'mission', label: 'Mission' },
              { value: 'food', label: 'Food & Drink' },
              { value: 'accommodation', label: 'Accommodation' },
              { value: 'transport', label: 'Transport' },
              { value: 'equipment', label: 'Equipment' },
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'medical', label: 'Medical' },
              { value: 'entertainment', label: 'Entertainment' },
              { value: 'other', label: 'Other' },
            ]}
            className="w-full"
            allowCustom
          />
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category[0]}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            value={formData.date.split('T')[0]}
            onChange={(e) => setFormData({ 
              ...formData, 
              date: e.target.value + 'T00:00:00.000Z' 
            })}
            className="w-full p-2 border border-border rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Related To</label>
          <EditableText
            value={formData.relatedTo || ''}
            onChange={(value) => setFormData({ ...formData, relatedTo: value })}
            placeholder="Equipment ID, mission name, etc."
            className="w-full"
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? 'Update' : 'Add'} Transaction
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CharacterFinances;
