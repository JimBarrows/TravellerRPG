import React, { useState, useMemo } from 'react';
import type { FinancialRecord } from '../../../../types/characterSheet';
import Card, { CardHeader, CardContent } from '../../../../../../shared/components/molecules/Card';
import Button from '../../../../../../shared/components/atoms/Button';

interface TransactionHistoryProps {
  transactions: FinancialRecord[];
  onAddTransaction: () => void;
  onEditTransaction: (transaction: FinancialRecord) => void;
  onDeleteTransaction: (id: string) => void;
  readonly?: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  readonly = false,
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer' | 'adjustment'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = Array.from(new Set(transactions.map(t => t.category)));
    return cats.sort();
  }, [transactions]);

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply filters
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term) ||
        (t.relatedTo && t.relatedTo.toLowerCase().includes(term))
      );
    }

    // Sort
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [transactions, sortBy, sortOrder, filterType, filterCategory, searchTerm]);

  // Paginate results
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedTransactions, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);

  // Calculate totals for current filter
  const totals = useMemo(() => {
    return filteredAndSortedTransactions.reduce((acc, transaction) => {
      switch (transaction.type) {
        case 'income':
          acc.income += transaction.amount;
          break;
        case 'expense':
          acc.expenses += transaction.amount;
          break;
        default:
          // transfers and adjustments don't affect totals
          break;
      }
      return acc;
    }, { income: 0, expenses: 0 });
  }, [filteredAndSortedTransactions]);

  const handleSort = (field: typeof sortBy) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getTransactionIcon = (type: FinancialRecord['type']) => {
    switch (type) {
      case 'income': return '💰';
      case 'expense': return '💸';
      case 'transfer': return '🔄';
      case 'adjustment': return '⚖️';
      default: return '📋';
    }
  };

  const getTransactionColor = (type: FinancialRecord['type']) => {
    switch (type) {
      case 'income': return 'text-green-600';
      case 'expense': return 'text-red-600';
      case 'transfer': return 'text-blue-600';
      case 'adjustment': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-2xl font-bold text-green-700">
            Cr{totals.income.toLocaleString()}
          </div>
          <div className="text-sm text-green-600">Total Income</div>
        </div>
        
        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-2xl font-bold text-red-700">
            Cr{totals.expenses.toLocaleString()}
          </div>
          <div className="text-sm text-red-600">Total Expenses</div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className={`text-2xl font-bold ${
            totals.income - totals.expenses >= 0 ? 'text-blue-700' : 'text-red-700'
          }`}>
            Cr{(totals.income - totals.expenses).toLocaleString()}
          </div>
          <div className="text-sm text-blue-600">Net</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Transaction History</h3>
            {!readonly && (
              <Button variant="primary" size="sm" onClick={onAddTransaction}>
                ➕ Add Transaction
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 border border-border rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 border border-border rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 border border-border rounded-md text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Results</label>
                <div className="text-sm text-muted-foreground p-2">
                  {filteredAndSortedTransactions.length} transaction{filteredAndSortedTransactions.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Transaction Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th 
                      className="text-left p-2 cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {sortBy === 'date' && (
                          <span className="text-xs">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left p-2 cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-1">
                        Type
                        {sortBy === 'type' && (
                          <span className="text-xs">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="text-left p-2">Description</th>
                    <th 
                      className="text-left p-2 cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-1">
                        Category
                        {sortBy === 'category' && (
                          <span className="text-xs">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-right p-2 cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Amount
                        {sortBy === 'amount' && (
                          <span className="text-xs">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    {!readonly && <th className="text-center p-2">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.length === 0 ? (
                    <tr>
                      <td 
                        colSpan={readonly ? 5 : 6} 
                        className="text-center p-8 text-muted-foreground"
                      >
                        {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                          ? 'No transactions match your filters'
                          : 'No transactions recorded yet'
                        }
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((transaction) => (
                      <tr 
                        key={transaction.id} 
                        className="border-b border-border hover:bg-muted/30"
                      >
                        <td className="p-2 text-sm">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span>{getTransactionIcon(transaction.type)}</span>
                            <span className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="text-sm font-medium">{transaction.description}</div>
                          {transaction.relatedTo && (
                            <div className="text-xs text-muted-foreground">
                              Related: {transaction.relatedTo}
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <span className="text-sm bg-muted px-2 py-1 rounded-full">
                            {transaction.category}
                          </span>
                        </td>
                        <td className={`p-2 text-right font-mono ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'expense' ? '-' : '+'}Cr{Math.abs(transaction.amount).toLocaleString()}
                        </td>
                        {!readonly && (
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditTransaction(transaction)}
                                title="Edit transaction"
                              >
                                ✏️
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this transaction?')) {
                                    onDeleteTransaction(transaction.id);
                                  }
                                }}
                                title="Delete transaction"
                                className="text-red-600 hover:text-red-700"
                              >
                                🗑️
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length} transactions
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory;