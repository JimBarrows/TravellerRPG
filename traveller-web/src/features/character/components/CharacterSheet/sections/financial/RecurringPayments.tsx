import React, { useState, useMemo } from 'react';
import type { CharacterSheetData, CharacterSheetSectionProps } from '../../../../types/characterSheet';
import { creditAmountSchema } from '../../../../validation/schemas';
import Card, { CardHeader, CardContent } from '../../../../../../shared/components/molecules/Card';
import Button from '../../../../../../shared/components/atoms/Button';
import Modal from '../../../../../../shared/components/molecules/Modal';
import { EditableNumber, EditableText, EditableSelect } from '../../../EditableFields';

// Extended financial types for recurring payments
interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: string;
  type: 'income' | 'expense';
  nextPayment: string;
  isActive: boolean;
  description?: string;
  relatedTo?: string; // ship mortgage, insurance policy, etc.
}

interface TravellerLivingCosts {
  socialStanding: number;
  baseLivingCost: number;
  luxuryMultiplier: number;
  worldType: 'low' | 'standard' | 'high' | 'industrial' | 'agricultural' | 'garden';
}

interface RecurringPaymentsProps extends CharacterSheetSectionProps {
  character: CharacterSheetData;
}

const RecurringPayments: React.FC<RecurringPaymentsProps> = ({ 
  character, 
  onUpdate, 
  readonly = false 
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [livingCosts, setLivingCosts] = useState<TravellerLivingCosts>({
    socialStanding: character.characteristics.social,
    baseLivingCost: calculateBaseLivingCost(character.characteristics.social),
    luxuryMultiplier: 1,
    worldType: 'standard'
  });

  // Calculate base living costs based on Social Standing (Traveller RPG rules)
  function calculateBaseLivingCost(socialStanding: number): number {
    // Base monthly living costs by Social Standing
    const baseCosts: Record<number, number> = {
      0: 0,     // Outcast
      1: 200,   // Drifter
      2: 400,   // Citizen
      3: 600,   // Citizen
      4: 800,   // Citizen
      5: 1000,  // Citizen
      6: 1200,  // Citizen
      7: 1500,  // Upper class
      8: 2000,  // Upper class
      9: 3000,  // Upper class
      10: 4000, // Noble
      11: 6000, // Noble
      12: 8000, // Noble
      13: 12000, // High noble
      14: 16000, // High noble
      15: 24000, // Royalty
    };
    
    return baseCosts[Math.min(Math.max(socialStanding, 0), 15)] || baseCosts[6];
  }

  // Calculate world type modifier
  const getWorldModifier = (worldType: TravellerLivingCosts['worldType']): number => {
    const modifiers = {
      low: 0.5,        // Low-tech worlds
      agricultural: 0.7, // Agricultural worlds
      standard: 1.0,    // Standard worlds
      industrial: 1.2,  // Industrial worlds
      high: 1.5,       // High-tech worlds
      garden: 2.0      // Garden worlds (luxury)
    };
    return modifiers[worldType];
  };

  // Calculate total monthly living expenses
  const calculateMonthlyLiving = useMemo(() => {
    const worldModifier = getWorldModifier(livingCosts.worldType);
    return Math.round(livingCosts.baseLivingCost * livingCosts.luxuryMultiplier * worldModifier);
  }, [livingCosts]);

  // Calculate ship mortgage payment
  const shipMortgage = useMemo(() => {
    // Check if character owns a ship from equipment
    const ship = character.equipment.find(eq => 
      eq.category === 'vehicle' && 
      (eq.name.toLowerCase().includes('ship') || eq.type.toLowerCase().includes('ship'))
    );
    
    if (ship && ship.cost > 0) {
      // Traveller standard: 1/240th of ship cost per month for 40 years
      return Math.round(ship.cost / 240);
    }
    return 0;
  }, [character.equipment]);

  // Get all recurring payments including calculated ones
  const allPayments = useMemo(() => {
    const calculated: RecurringPayment[] = [];
    
    // Living expenses
    if (calculateMonthlyLiving > 0) {
      calculated.push({
        id: 'living-expenses',
        name: 'Living Expenses',
        amount: calculateMonthlyLiving,
        frequency: 'monthly',
        category: 'living',
        type: 'expense',
        nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        description: `Social Standing ${character.characteristics.social} lifestyle on ${livingCosts.worldType} world`,
        relatedTo: 'social-standing'
      });
    }
    
    // Ship mortgage
    if (shipMortgage > 0) {
      calculated.push({
        id: 'ship-mortgage',
        name: 'Ship Mortgage',
        amount: shipMortgage,
        frequency: 'monthly',
        category: 'ship',
        type: 'expense',
        nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        description: 'Standard 40-year ship financing',
        relatedTo: 'ship-ownership'
      });
    }
    
    return [...calculated, ...recurringPayments];
  }, [calculateMonthlyLiving, shipMortgage, recurringPayments, character.characteristics.social, livingCosts.worldType]);

  // Calculate totals
  const totals = useMemo(() => {
    return allPayments.filter(p => p.isActive).reduce((acc, payment) => {
      const monthlyAmount = convertToMonthly(payment.amount, payment.frequency);
      if (payment.type === 'income') {
        acc.income += monthlyAmount;
      } else {
        acc.expenses += monthlyAmount;
      }
      return acc;
    }, { income: 0, expenses: 0 });
  }, [allPayments]);

  // Convert any frequency to monthly amount
  function convertToMonthly(amount: number, frequency: RecurringPayment['frequency']): number {
    switch (frequency) {
      case 'daily': return amount * 30;
      case 'weekly': return amount * 4.33;
      case 'monthly': return amount;
      case 'quarterly': return amount / 3;
      case 'yearly': return amount / 12;
      default: return amount;
    }
  }

  // Format next payment date
  const formatNextPayment = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Add or update recurring payment
  const savePayment = (payment: Omit<RecurringPayment, 'id'>) => {
    if (editingPayment) {
      setRecurringPayments(prev => 
        prev.map(p => p.id === editingPayment.id ? { ...payment, id: editingPayment.id } : p)
      );
    } else {
      const newPayment: RecurringPayment = {
        ...payment,
        id: crypto.randomUUID(),
      };
      setRecurringPayments(prev => [...prev, newPayment]);
    }
    
    setEditingPayment(null);
    setShowPaymentModal(false);
  };

  // Delete recurring payment
  const deletePayment = (id: string) => {
    setRecurringPayments(prev => prev.filter(p => p.id !== id));
  };

  // Toggle payment active status
  const togglePayment = (id: string) => {
    setRecurringPayments(prev => 
      prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p)
    );
  };

  // Update living costs and recalculate
  const updateLivingCosts = (updates: Partial<TravellerLivingCosts>) => {
    setLivingCosts(prev => ({ ...prev, ...updates }));
  };

  // Process all due payments (simulate)
  const processDuePayments = () => {
    const today = new Date().toISOString().split('T')[0];
    const duePayments = allPayments.filter(p => {
      const paymentDate = new Date(p.nextPayment).toISOString().split('T')[0];
      return p.isActive && paymentDate <= today;
    });
    
    if (duePayments.length === 0) {
      alert('No payments are due today.');
      return;
    }
    
    // In a real app, this would create actual transactions
    alert(`Processed ${duePayments.length} payment(s). Check transaction history for details.`);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-2xl font-bold text-green-700">
            Cr{totals.income.toLocaleString()}
          </div>
          <div className="text-sm text-green-600">Monthly Income</div>
        </div>
        
        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-2xl font-bold text-red-700">
            Cr{totals.expenses.toLocaleString()}
          </div>
          <div className="text-sm text-red-600">Monthly Expenses</div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className={`text-2xl font-bold ${
            totals.income - totals.expenses >= 0 ? 'text-blue-700' : 'text-red-700'
          }`}>
            Cr{(totals.income - totals.expenses).toLocaleString()}
          </div>
          <div className="text-sm text-blue-600">Net Monthly</div>
        </div>
      </div>

      {/* Living Expenses Calculator */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">🏠 Living Expenses Calculator</h3>
          <p className="text-sm text-muted-foreground">
            Based on Social Standing and world type (Traveller RPG rules)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Social Standing</label>
              <div className="p-3 bg-muted rounded-lg text-center font-semibold">
                {character.characteristics.social}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">World Type</label>
              <select
                value={livingCosts.worldType}
                onChange={(e) => updateLivingCosts({ worldType: e.target.value as any })}
                disabled={readonly}
                className="w-full p-2 border border-border rounded-md"
              >
                <option value="low">Low Tech (×0.5)</option>
                <option value="agricultural">Agricultural (×0.7)</option>
                <option value="standard">Standard (×1.0)</option>
                <option value="industrial">Industrial (×1.2)</option>
                <option value="high">High Tech (×1.5)</option>
                <option value="garden">Garden World (×2.0)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Luxury Level</label>
              <select
                value={livingCosts.luxuryMultiplier}
                onChange={(e) => updateLivingCosts({ luxuryMultiplier: parseFloat(e.target.value) })}
                disabled={readonly}
                className="w-full p-2 border border-border rounded-md"
              >
                <option value={0.5}>Subsistence (×0.5)</option>
                <option value={1.0}>Standard (×1.0)</option>
                <option value={1.5}>Comfortable (×1.5)</option>
                <option value={2.0}>Luxury (×2.0)</option>
                <option value={3.0}>Extravagant (×3.0)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Cost</label>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center font-semibold text-green-700">
                Cr{calculateMonthlyLiving.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recurring Payments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">💳 Recurring Payments</h3>
            <div className="flex gap-2">
              {!readonly && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={processDuePayments}
                    disabled={!allPayments.some(p => {
                      const today = new Date().toISOString().split('T')[0];
                      const paymentDate = new Date(p.nextPayment).toISOString().split('T')[0];
                      return p.isActive && paymentDate <= today;
                    })}
                  >
                    ⚡ Process Due
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    ➕ Add Payment
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {allPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recurring payments configured
              </div>
            ) : (
              <div className="space-y-3">
                {allPayments.map((payment) => (
                  <div 
                    key={payment.id}
                    className={`p-4 border border-border rounded-lg ${
                      !payment.isActive ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            payment.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <h4 className="font-medium">{payment.name}</h4>
                          <span className="text-sm bg-muted px-2 py-1 rounded-full">
                            {payment.category}
                          </span>
                          {!payment.isActive && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                              Paused
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className={`font-mono font-semibold ${
                              payment.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {payment.type === 'expense' ? '-' : '+'}Cr{payment.amount.toLocaleString()} 
                              <span className="text-muted-foreground">/{payment.frequency}</span>
                            </span>
                            <span>Next: {formatNextPayment(payment.nextPayment)}</span>
                          </div>
                          {payment.description && (
                            <div className="mt-1">{payment.description}</div>
                          )}
                        </div>
                      </div>
                      
                      {!readonly && !payment.id.startsWith('living-') && !payment.id.startsWith('ship-') && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePayment(payment.id)}
                            title={payment.isActive ? 'Pause payment' : 'Resume payment'}
                          >
                            {payment.isActive ? '⏸️' : '▶️'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPayment(payment);
                              setShowPaymentModal(true);
                            }}
                            title="Edit payment"
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this recurring payment?')) {
                                deletePayment(payment.id);
                              }
                            }}
                            title="Delete payment"
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

      {/* Add/Edit Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setEditingPayment(null);
          }}
          onSave={savePayment}
          payment={editingPayment}
          isEditing={!!editingPayment}
        />
      )}
    </div>
  );
};

// Payment Modal Component
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Omit<RecurringPayment, 'id'>) => void;
  payment?: RecurringPayment | null;
  isEditing?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  payment, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState<Omit<RecurringPayment, 'id'>>(() => ({
    name: payment?.name || '',
    amount: payment?.amount || 0,
    frequency: payment?.frequency || 'monthly',
    category: payment?.category || '',
    type: payment?.type || 'expense',
    nextPayment: payment?.nextPayment || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: payment?.isActive ?? true,
    description: payment?.description || '',
    relatedTo: payment?.relatedTo || '',
  }));

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.category.trim() || formData.amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }
    
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Recurring Payment' : 'Add Recurring Payment'}
      size="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <EditableText
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="Payment name"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Type *</label>
            <EditableSelect
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value as any })}
              options={[
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
              ]}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount *</label>
            <EditableNumber
              value={formData.amount}
              onChange={(value) => setFormData({ ...formData, amount: value })}
              validation={creditAmountSchema}
              currency
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Frequency *</label>
            <EditableSelect
              value={formData.frequency}
              onChange={(value) => setFormData({ ...formData, frequency: value as any })}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Category *</label>
          <EditableSelect
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value })}
            options={[
              { value: 'salary', label: 'Salary' },
              { value: 'ship', label: 'Ship/Vehicle' },
              { value: 'insurance', label: 'Insurance' },
              { value: 'medical', label: 'Medical' },
              { value: 'living', label: 'Living Expenses' },
              { value: 'subscription', label: 'Subscription' },
              { value: 'investment', label: 'Investment' },
              { value: 'other', label: 'Other' },
            ]}
            className="w-full"
            allowCustom
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Next Payment</label>
          <input
            type="date"
            value={formData.nextPayment.split('T')[0]}
            onChange={(e) => setFormData({ 
              ...formData, 
              nextPayment: e.target.value + 'T00:00:00.000Z' 
            })}
            className="w-full p-2 border border-border rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <EditableText
            value={formData.description || ''}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Optional description"
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            Active (process payments automatically)
          </label>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? 'Update' : 'Add'} Payment
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RecurringPayments;