/**
 * Subscription Service
 * Handles subscription tier management, feature access control, and billing
 */

import { tokenManager } from '../utils/tokenUtils';

// Subscription tier definitions
const SUBSCRIPTION_TIERS = {
  Free: {
    name: 'Free',
    price: 0,
    billingPeriod: null,
    features: [
      'basic_character_sheet',
      'dice_roller',
      'basic_notes'
    ],
    limits: {
      characters: 3,
      campaigns: 1,
      storage: '100MB',
      api_calls: 100
    },
    description: 'Perfect for trying out Traveller RPG tools'
  },
  Standard: {
    name: 'Standard',
    price: 999, // $9.99
    billingPeriod: 'monthly',
    features: [
      'basic_character_sheet',
      'advanced_character_sheet',
      'dice_roller',
      'advanced_notes',
      'character_portraits',
      'campaign_management',
      'shared_campaigns'
    ],
    limits: {
      characters: 25,
      campaigns: 10,
      storage: '1GB',
      api_calls: 1000
    },
    description: 'Great for regular players and game masters'
  },
  Premium: {
    name: 'Premium',
    price: 1999, // $19.99
    billingPeriod: 'monthly',
    features: [
      'basic_character_sheet',
      'advanced_character_sheet',
      'ai_character_generation',
      'dice_roller',
      'advanced_dice_mechanics',
      'advanced_notes',
      'ai_story_assistant',
      'character_portraits',
      'custom_portraits',
      'campaign_management',
      'advanced_campaign_tools',
      'shared_campaigns',
      'priority_support',
      'beta_features'
    ],
    limits: {
      characters: 'unlimited',
      campaigns: 'unlimited',
      storage: '10GB',
      api_calls: 'unlimited'
    },
    description: 'Ultimate experience for serious Traveller enthusiasts'
  }
};

class SubscriptionService {
  /**
   * Gets user's current subscription information
   * @param {string} userId - User ID
   * @param {boolean} createDefault - Whether to create default free subscription if none exists
   * @returns {Promise<object>} Subscription details
   */
  async getUserSubscription(userId, createDefault = false) {
    try {
      const tokens = await tokenManager.getTokens();
      if (!tokens || !tokens.accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/subscriptions/${userId}`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 404 && createDefault) {
          // Return default free subscription for new users
          return this.createDefaultSubscription(userId);
        }
        
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Get subscription error:', error);
      
      if (createDefault && error.message.includes('not found')) {
        return this.createDefaultSubscription(userId);
      }
      
      throw error;
    }
  }

  /**
   * Updates user's subscription
   * @param {string} userId - User ID
   * @param {object} updateData - Subscription update data
   * @returns {Promise<object>} Updated subscription
   */
  async updateSubscription(userId, updateData) {
    try {
      const tokens = await tokenManager.getTokens();
      if (!tokens || !tokens.accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/subscriptions/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Update subscription error:', error);
      throw error;
    }
  }

  /**
   * Cancels user's subscription
   * @param {string} userId - User ID
   * @returns {Promise<object>} Cancelled subscription details
   */
  async cancelSubscription(userId) {
    try {
      const tokens = await tokenManager.getTokens();
      if (!tokens || !tokens.accessToken) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/subscriptions/${userId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw error;
    }
  }

  /**
   * Creates a default free subscription for new users
   * @param {string} userId - User ID
   * @returns {object} Default subscription
   */
  createDefaultSubscription(userId) {
    return {
      userId,
      tier: 'Free',
      status: 'active',
      features: SUBSCRIPTION_TIERS.Free.features,
      limits: SUBSCRIPTION_TIERS.Free.limits,
      createdAt: new Date().toISOString(),
      nextBillingDate: null,
      billingPeriod: null
    };
  }

  /**
   * Gets all available subscription tiers
   * @returns {Array} Array of subscription tier objects
   */
  getSubscriptionTiers() {
    return Object.values(SUBSCRIPTION_TIERS);
  }

  /**
   * Checks if user has access to a specific feature
   * @param {object} subscription - User's subscription
   * @param {string} feature - Feature to check
   * @returns {boolean} True if user has access
   */
  hasFeatureAccess(subscription, feature) {
    if (!subscription || !subscription.tier) {
      return false;
    }

    const tier = SUBSCRIPTION_TIERS[subscription.tier];
    if (!tier) {
      return false;
    }

    return tier.features.includes(feature);
  }

  /**
   * Checks if user is within their subscription limits
   * @param {object} subscription - User's subscription
   * @param {string} resource - Resource to check (e.g., 'characters', 'campaigns')
   * @param {number} currentUsage - Current usage count
   * @returns {boolean} True if within limits
   */
  isWithinLimits(subscription, resource, currentUsage) {
    if (!subscription || !subscription.tier) {
      return false;
    }

    const tier = SUBSCRIPTION_TIERS[subscription.tier];
    if (!tier || !tier.limits) {
      return false;
    }

    const limit = tier.limits[resource];
    if (limit === 'unlimited') {
      return true;
    }

    return currentUsage < limit;
  }

  /**
   * Gets available upgrade options for a tier
   * @param {string} currentTier - Current subscription tier
   * @returns {Array} Array of upgrade options
   */
  getUpgradeOptions(currentTier) {
    const tiers = Object.values(SUBSCRIPTION_TIERS);
    const currentIndex = tiers.findIndex(tier => tier.name === currentTier);
    
    if (currentIndex === -1) {
      return [];
    }

    return tiers.slice(currentIndex + 1);
  }

  /**
   * Gets available downgrade options for a tier
   * @param {string} currentTier - Current subscription tier
   * @returns {Array} Array of downgrade options
   */
  getDowngradeOptions(currentTier) {
    const tiers = Object.values(SUBSCRIPTION_TIERS);
    const currentIndex = tiers.findIndex(tier => tier.name === currentTier);
    
    if (currentIndex <= 0) {
      return [];
    }

    return tiers.slice(0, currentIndex).reverse();
  }

  /**
   * Calculates proration for subscription changes
   * @param {string} currentTier - Current tier
   * @param {string} newTier - New tier
   * @param {number} daysRemaining - Days remaining in current billing period
   * @returns {object} Proration details
   */
  calculateProration(currentTier, newTier, daysRemaining) {
    const currentPrice = SUBSCRIPTION_TIERS[currentTier]?.price || 0;
    const newPrice = SUBSCRIPTION_TIERS[newTier]?.price || 0;
    
    if (currentPrice === newPrice) {
      return {
        amount: 0,
        description: 'No charge for tier change'
      };
    }

    // Calculate daily rates
    const daysInMonth = 30;
    const currentDailyRate = currentPrice / daysInMonth;
    const newDailyRate = newPrice / daysInMonth;
    
    // Calculate proration
    const currentPeriodRefund = currentDailyRate * daysRemaining;
    const newPeriodCharge = newDailyRate * daysRemaining;
    const prorationAmount = Math.round((newPeriodCharge - currentPeriodRefund));

    return {
      amount: prorationAmount,
      description: prorationAmount > 0 
        ? `Additional charge for upgrade: ${this.formatPrice(prorationAmount)}`
        : `Credit for downgrade: ${this.formatPrice(Math.abs(prorationAmount))}`
    };
  }

  /**
   * Validates a subscription tier change
   * @param {string} currentTier - Current tier
   * @param {string} newTier - Proposed new tier
   * @returns {object} Validation result
   */
  validateSubscriptionChange(currentTier, newTier) {
    if (!SUBSCRIPTION_TIERS[currentTier]) {
      return {
        isValid: false,
        error: 'Invalid current subscription tier'
      };
    }

    if (!SUBSCRIPTION_TIERS[newTier]) {
      return {
        isValid: false,
        error: 'Invalid new subscription tier'
      };
    }

    if (currentTier === newTier) {
      return {
        isValid: false,
        error: 'Cannot change to the same subscription tier'
      };
    }

    const tierOrder = ['Free', 'Standard', 'Premium'];
    const currentIndex = tierOrder.indexOf(currentTier);
    const newIndex = tierOrder.indexOf(newTier);

    return {
      isValid: true,
      type: newIndex > currentIndex ? 'upgrade' : 'downgrade',
      currentTier,
      newTier
    };
  }

  /**
   * Formats price for display
   * @param {number} priceInCents - Price in cents
   * @param {string} currency - Currency code
   * @returns {string} Formatted price
   */
  formatPrice(priceInCents, currency = 'USD') {
    if (priceInCents === 0) {
      return 'Free';
    }

    const price = priceInCents / 100;
    
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£'
    };

    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${price.toFixed(2)}`;
  }

  /**
   * Gets subscription limits for a tier
   * @param {string} tier - Subscription tier name
   * @returns {object} Limits object
   */
  getSubscriptionLimits(tier) {
    return SUBSCRIPTION_TIERS[tier]?.limits || {};
  }

  /**
   * Gets subscription features for a tier
   * @param {string} tier - Subscription tier name
   * @returns {Array} Features array
   */
  getSubscriptionFeatures(tier) {
    return SUBSCRIPTION_TIERS[tier]?.features || [];
  }

  /**
   * Checks if a subscription is active
   * @param {object} subscription - Subscription object
   * @returns {boolean} True if subscription is active
   */
  isSubscriptionActive(subscription) {
    if (!subscription) {
      return false;
    }

    const activeStatuses = ['active', 'trialing'];
    return activeStatuses.includes(subscription.status);
  }

  /**
   * Gets feature comparison between tiers
   * @param {string} currentTier - Current tier
   * @param {string} targetTier - Target tier
   * @returns {object} Feature comparison
   */
  getFeatureComparison(currentTier, targetTier) {
    const currentFeatures = this.getSubscriptionFeatures(currentTier);
    const targetFeatures = this.getSubscriptionFeatures(targetTier);

    return {
      gained: targetFeatures.filter(f => !currentFeatures.includes(f)),
      lost: currentFeatures.filter(f => !targetFeatures.includes(f)),
      retained: currentFeatures.filter(f => targetFeatures.includes(f))
    };
  }
}

export default new SubscriptionService();