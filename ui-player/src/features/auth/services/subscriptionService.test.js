import { describe, it, expect, beforeEach, vi } from 'vitest';
import subscriptionService from './subscriptionService';

// Mock fetch
global.fetch = vi.fn();

describe('SubscriptionService', () => {
  const mockUser = {
    id: 'user123',
    email: 'test@example.com'
  };

  const mockSubscription = {
    tier: 'Standard',
    status: 'active',
    nextBillingDate: '2024-02-01',
    features: ['Feature A', 'Feature B'],
    limits: { maxCharacters: 10 }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockClear();
  });

  describe('getUserSubscription', () => {
    it('should fetch user subscription successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSubscription)
      });

      const result = await subscriptionService.getUserSubscription(mockUser.id);

      expect(fetch).toHaveBeenCalledWith(`/api/subscriptions/${mockUser.id}`, {
        headers: {
          'Authorization': expect.any(String)
        }
      });

      expect(result).toEqual(mockSubscription);
    });

    it('should handle subscription fetch errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Subscription not found' })
      });

      await expect(subscriptionService.getUserSubscription(mockUser.id))
        .rejects.toThrow('Subscription not found');
    });

    it('should return default free subscription for new users', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' })
      });

      // Mock the default behavior
      const result = await subscriptionService.getUserSubscription(mockUser.id, true);

      expect(result.tier).toBe('Free');
      expect(result.status).toBe('active');
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription tier successfully', async () => {
      const updateData = { tier: 'Premium' };
      const updatedSubscription = { ...mockSubscription, tier: 'Premium' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedSubscription)
      });

      const result = await subscriptionService.updateSubscription(mockUser.id, updateData);

      expect(fetch).toHaveBeenCalledWith(`/api/subscriptions/${mockUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': expect.any(String)
        },
        body: JSON.stringify(updateData)
      });

      expect(result.tier).toBe('Premium');
    });

    it('should handle subscription update errors', async () => {
      const updateData = { tier: 'Premium' };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid subscription tier' })
      });

      await expect(subscriptionService.updateSubscription(mockUser.id, updateData))
        .rejects.toThrow('Invalid subscription tier');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const cancelledSubscription = { ...mockSubscription, status: 'cancelled' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(cancelledSubscription)
      });

      const result = await subscriptionService.cancelSubscription(mockUser.id);

      expect(fetch).toHaveBeenCalledWith(`/api/subscriptions/${mockUser.id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': expect.any(String)
        }
      });

      expect(result.status).toBe('cancelled');
    });

    it('should handle cancellation errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Cannot cancel subscription' })
      });

      await expect(subscriptionService.cancelSubscription(mockUser.id))
        .rejects.toThrow('Cannot cancel subscription');
    });
  });

  describe('getSubscriptionTiers', () => {
    it('should return all available subscription tiers', () => {
      const tiers = subscriptionService.getSubscriptionTiers();

      expect(tiers).toHaveLength(3);
      expect(tiers[0].name).toBe('Free');
      expect(tiers[1].name).toBe('Standard');
      expect(tiers[2].name).toBe('Premium');

      tiers.forEach(tier => {
        expect(tier).toHaveProperty('name');
        expect(tier).toHaveProperty('price');
        expect(tier).toHaveProperty('features');
        expect(tier).toHaveProperty('limits');
      });
    });
  });

  describe('hasFeatureAccess', () => {
    it('should return true for features included in subscription', () => {
      const subscription = { tier: 'Standard' };
      const hasAccess = subscriptionService.hasFeatureAccess(subscription, 'character_sheets');
      expect(hasAccess).toBe(true);
    });

    it('should return false for features not included in subscription', () => {
      const subscription = { tier: 'Free' };
      const hasAccess = subscriptionService.hasFeatureAccess(subscription, 'unlimited_characters');
      expect(hasAccess).toBe(false);
    });

    it('should handle Premium tier with all features', () => {
      const subscription = { tier: 'Premium' };
      const hasAccess = subscriptionService.hasFeatureAccess(subscription, 'ai_assistant');
      expect(hasAccess).toBe(true);
    });
  });

  describe('isWithinLimits', () => {
    it('should return true when within limits', () => {
      const subscription = { tier: 'Standard' };
      const isWithin = subscriptionService.isWithinLimits(subscription, 'characters', 5);
      expect(isWithin).toBe(true);
    });

    it('should return false when exceeding limits', () => {
      const subscription = { tier: 'Free' };
      const isWithin = subscriptionService.isWithinLimits(subscription, 'characters', 5);
      expect(isWithin).toBe(false);
    });

    it('should return true for Premium tier with unlimited resources', () => {
      const subscription = { tier: 'Premium' };
      const isWithin = subscriptionService.isWithinLimits(subscription, 'characters', 1000);
      expect(isWithin).toBe(true);
    });
  });

  describe('getUpgradeOptions', () => {
    it('should return available upgrade options for Free tier', () => {
      const options = subscriptionService.getUpgradeOptions('Free');
      expect(options).toHaveLength(2);
      expect(options.map(o => o.name)).toEqual(['Standard', 'Premium']);
    });

    it('should return available upgrade options for Standard tier', () => {
      const options = subscriptionService.getUpgradeOptions('Standard');
      expect(options).toHaveLength(1);
      expect(options[0].name).toBe('Premium');
    });

    it('should return empty array for Premium tier', () => {
      const options = subscriptionService.getUpgradeOptions('Premium');
      expect(options).toHaveLength(0);
    });
  });

  describe('getDowngradeOptions', () => {
    it('should return available downgrade options for Premium tier', () => {
      const options = subscriptionService.getDowngradeOptions('Premium');
      expect(options).toHaveLength(2);
      expect(options.map(o => o.name)).toEqual(['Standard', 'Free']);
    });

    it('should return available downgrade options for Standard tier', () => {
      const options = subscriptionService.getDowngradeOptions('Standard');
      expect(options).toHaveLength(1);
      expect(options[0].name).toBe('Free');
    });

    it('should return empty array for Free tier', () => {
      const options = subscriptionService.getDowngradeOptions('Free');
      expect(options).toHaveLength(0);
    });
  });

  describe('calculateProration', () => {
    it('should calculate proration for upgrade', () => {
      const currentTier = 'Standard';
      const newTier = 'Premium';
      const daysRemaining = 15;

      const proration = subscriptionService.calculateProration(currentTier, newTier, daysRemaining);

      expect(proration).toHaveProperty('amount');
      expect(proration).toHaveProperty('description');
      expect(proration.amount).toBeGreaterThan(0);
    });

    it('should calculate credit for downgrade', () => {
      const currentTier = 'Premium';
      const newTier = 'Standard';
      const daysRemaining = 15;

      const proration = subscriptionService.calculateProration(currentTier, newTier, daysRemaining);

      expect(proration).toHaveProperty('amount');
      expect(proration).toHaveProperty('description');
      expect(proration.amount).toBeLessThan(0); // Credit
    });

    it('should return zero for same tier', () => {
      const proration = subscriptionService.calculateProration('Standard', 'Standard', 15);
      expect(proration.amount).toBe(0);
    });
  });

  describe('validateSubscriptionChange', () => {
    it('should validate upgrade to higher tier', () => {
      const validation = subscriptionService.validateSubscriptionChange('Free', 'Standard');
      expect(validation.isValid).toBe(true);
      expect(validation.type).toBe('upgrade');
    });

    it('should validate downgrade to lower tier', () => {
      const validation = subscriptionService.validateSubscriptionChange('Premium', 'Standard');
      expect(validation.isValid).toBe(true);
      expect(validation.type).toBe('downgrade');
    });

    it('should reject invalid tier change', () => {
      const validation = subscriptionService.validateSubscriptionChange('Free', 'InvalidTier');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Invalid');
    });

    it('should reject same tier change', () => {
      const validation = subscriptionService.validateSubscriptionChange('Standard', 'Standard');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('same');
    });
  });

  describe('formatPrice', () => {
    it('should format price correctly', () => {
      const formatted = subscriptionService.formatPrice(1999); // $19.99
      expect(formatted).toBe('$19.99');
    });

    it('should handle zero price', () => {
      const formatted = subscriptionService.formatPrice(0);
      expect(formatted).toBe('Free');
    });

    it('should handle different currencies', () => {
      const formatted = subscriptionService.formatPrice(2000, 'EUR');
      expect(formatted).toBe('€20.00');
    });
  });
});