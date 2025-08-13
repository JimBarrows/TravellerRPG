# GraphQL API Testing Guide

## Overview

This guide covers testing strategies for the Traveller RPG GraphQL API, including unit tests, integration tests, and manual testing procedures.

## Testing Structure

```
infrastructure/lambda/resolvers/test/
├── queries.test.js      # Unit tests for query resolvers
├── mutations.test.js    # Unit tests for mutation resolvers
├── integration.test.js  # Integration test examples
└── README.md           # This guide
```

## Running Tests

### Unit Tests

```bash
cd infrastructure/lambda/resolvers
npm test
```

### Test Coverage

```bash
npm test -- --coverage
```

### Watch Mode

```bash
npm test -- --watch
```

## Test Categories

### 1. Unit Tests

#### Query Resolver Tests (`queries.test.js`)

Tests for individual GraphQL query resolvers:

- **getCurrentUser**: Authentication and user data retrieval
- **getCampaign**: Campaign access control and data fetching
- **listCampaigns**: Public campaign listing with filtering
- **getCharacter**: Character access control and data structure
- **listDiceRolls**: Dice roll history with campaign access

**Example Test:**
```javascript
it('should return campaign data with access check', async () => {
  const mockUser = { id: 'user1', username: 'testuser' };
  const mockCampaign = { /* campaign data */ };

  getUserFromEvent.mockReturnValue(mockUser);
  requireCampaignAccess.mockResolvedValue(true);
  
  // Mock database response
  withDatabase.mockImplementation(async (callback) => {
    const mockPrisma = {
      campaign: { findUnique: jest.fn().mockResolvedValue(mockCampaign) }
    };
    return callback(mockPrisma);
  });

  const result = await queries.getCampaign(event, { id: 'campaign1' });
  
  expect(result.name).toBe('Test Campaign');
  expect(requireCampaignAccess).toHaveBeenCalledWith(mockPrisma, mockUser, 'campaign1');
});
```

#### Mutation Resolver Tests (`mutations.test.js`)

Tests for GraphQL mutation resolvers:

- **createCampaign**: Campaign creation with validation
- **updateCharacter**: Character updates with ownership checks
- **rollDice**: Dice rolling with Traveller mechanics
- **deleteCampaign**: Campaign deletion with gamemaster checks
- **invitePlayerToCampaign**: Player invitation management

**Example Test:**
```javascript
it('should create a dice roll with valid notation', async () => {
  const mockInput = {
    campaignId: 'campaign1',
    dice: '2d6',
    isPublic: true,
    description: 'Attack roll'
  };

  validateDiceNotation.mockReturnValue({ count: 2, sides: 6, modifier: 0 });
  
  // Mock Math.random for predictable results
  Math.random = jest.fn()
    .mockReturnValueOnce(0.33) // First die: 3
    .mockReturnValueOnce(0.67); // Second die: 5

  const result = await mutations.rollDice(event, { input: mockInput });
  
  expect(result.dice).toBe('2d6');
  expect(result.individual).toEqual([3, 5]);
  expect(result.result).toBe(8);
});
```

### 2. Integration Tests

#### API Flow Tests (`integration.test.js`)

Demonstrates complete API usage patterns:

- **Campaign Management Flow**: Full campaign creation and management
- **Character Creation**: Traveller character mechanics
- **Dice Rolling**: 2d6 system integration
- **Real-time Subscriptions**: WebSocket integration
- **Pagination**: Cursor-based pagination examples
- **Error Handling**: Common error scenarios
- **World Building**: Star system and planet creation

### 3. Manual Testing

#### GraphQL Playground

Use AWS AppSync console or GraphQL Playground for manual testing:

1. **Access the GraphQL endpoint**:
   ```
   https://your-appsync-id.appsync-api.region.amazonaws.com/graphql
   ```

2. **Authentication headers**:
   ```json
   {
     "Authorization": "Bearer YOUR_JWT_TOKEN"
   }
   ```

3. **Sample queries and mutations** (see API_DOCUMENTATION.md)

#### Postman Collection

Create a Postman collection with:

- Authentication setup
- Sample queries
- Sample mutations
- Subscription examples
- Error case testing

## Testing Best Practices

### 1. Test Structure

Follow the AAA pattern:
- **Arrange**: Set up mocks and test data
- **Act**: Execute the function under test
- **Assert**: Verify the results

### 2. Mock Strategy

- **Database calls**: Mock with `withDatabase`
- **Authentication**: Mock with `getUserFromEvent`
- **Authorization**: Mock access control functions
- **External APIs**: Mock AWS SDK calls
- **Time-dependent code**: Mock `Date.now()` and `Math.random()`

### 3. Test Data

Use realistic Traveller RPG data:
- **Characteristics**: Values 1-15
- **UWP codes**: Valid format (A788899-C)
- **Dice notation**: Standard formats (2d6, 1d20+3)
- **Skill levels**: 0-15 range

### 4. Error Testing

Test all error conditions:
- Authentication failures
- Authorization denials
- Validation errors
- Database errors
- Invalid input formats

## Traveller RPG Specific Testing

### 1. Character Creation

Test Traveller character mechanics:

```javascript
it('validates Traveller characteristics range', () => {
  const characteristics = {
    strength: 8, dexterity: 10, endurance: 9,
    intelligence: 12, education: 11, socialStanding: 7
  };
  
  Object.values(characteristics).forEach(stat => {
    expect(stat).toBeGreaterThanOrEqual(1);
    expect(stat).toBeLessThanOrEqual(15);
  });
});
```

### 2. Dice Mechanics

Test 2d6 system:

```javascript
it('validates 2d6 roll results', () => {
  const result = rollTwoDSix();
  expect(result.total).toBeGreaterThanOrEqual(2);
  expect(result.total).toBeLessThanOrEqual(12);
  expect(result.individual).toHaveLength(2);
});
```

### 3. UWP Validation

Test Universal World Profile format:

```javascript
it('validates UWP format', () => {
  const uwp = 'A788899-C';
  expect(uwp).toMatch(/^[A-EX][0-9A-F]{6}-[0-9A-F]+$/);
});
```

### 4. Trade Codes

Test trade classification system:

```javascript
it('validates trade codes', () => {
  const tradeCodes = ['Ri', 'In', 'Hi'];
  const validCodes = [
    'Ag', 'As', 'Ba', 'De', 'Fl', 'Ga', 'Hi', 'Ht',
    'IC', 'In', 'Lo', 'Lt', 'Na', 'Ni', 'Po', 'Ri',
    'Va', 'Wa'
  ];
  
  tradeCodes.forEach(code => {
    expect(validCodes).toContain(code);
  });
});
```

## Performance Testing

### 1. Query Performance

Test response times for complex queries:

```javascript
it('should respond within acceptable time limits', async () => {
  const startTime = Date.now();
  
  await queries.getCampaign(event, { id: 'campaign1' });
  
  const endTime = Date.now();
  expect(endTime - startTime).toBeLessThan(1000); // 1 second max
});
```

### 2. Pagination Performance

Test large dataset handling:

```javascript
it('should handle large paginated results efficiently', async () => {
  const args = { first: 100 };
  const result = await queries.campaignsPaginated(event, args);
  
  expect(result.edges).toHaveLength(100);
  expect(result.pageInfo.hasNextPage).toBeDefined();
});
```

### 3. Concurrent Access

Test multiple simultaneous requests:

```javascript
it('should handle concurrent dice rolls', async () => {
  const promises = Array(10).fill().map(() => 
    mutations.rollDice(event, { input: diceRollInput })
  );
  
  const results = await Promise.all(promises);
  expect(results).toHaveLength(10);
  
  // Ensure all rolls have unique IDs
  const ids = results.map(r => r.id);
  expect(new Set(ids).size).toBe(10);
});
```

## Security Testing

### 1. Authorization Tests

Verify access control:

```javascript
it('should deny access to private campaigns', async () => {
  const unauthorizedUser = { id: 'user2' };
  
  getUserFromEvent.mockReturnValue(unauthorizedUser);
  requireCampaignAccess.mockRejectedValue(
    new Error('Access denied: Not a member of this campaign')
  );
  
  await expect(queries.getCampaign(event, { id: 'campaign1' }))
    .rejects.toThrow('Access denied');
});
```

### 2. Input Validation

Test malicious input handling:

```javascript
it('should sanitize malicious input', async () => {
  const maliciousInput = {
    name: '<script>alert("xss")</script>',
    description: 'DROP TABLE campaigns;'
  };
  
  // Should throw validation error before reaching database
  await expect(mutations.createCampaign(event, { input: maliciousInput }))
    .rejects.toThrow('Validation failed');
});
```

### 3. Rate Limiting

Test API rate limits:

```javascript
it('should enforce rate limits', async () => {
  // Simulate rapid requests
  const rapidRequests = Array(101).fill().map(() => 
    queries.getCurrentUser(event)
  );
  
  // Some requests should be rate limited
  const results = await Promise.allSettled(rapidRequests);
  const rejected = results.filter(r => r.status === 'rejected');
  
  expect(rejected.length).toBeGreaterThan(0);
});
```

## Continuous Integration

### GitHub Actions

```yaml
name: API Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd infrastructure/lambda/resolvers
          npm install
      
      - name: Run tests
        run: |
          cd infrastructure/lambda/resolvers
          npm test -- --coverage --ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v1
        with:
          file: ./infrastructure/lambda/resolvers/coverage/lcov.info
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "cd infrastructure/lambda/resolvers && npm test"
    }
  }
}
```

## Debugging Tips

### 1. Mock Issues

Common mock debugging:

```javascript
// Debug mock calls
console.log('Mock calls:', mockFunction.mock.calls);

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Check mock implementations
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
```

### 2. Async Testing

Handle promises correctly:

```javascript
// Use async/await
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// Or return promises
it('should handle promises', () => {
  return asyncFunction().then(result => {
    expect(result).toBeDefined();
  });
});
```

### 3. Database Mocking

Ensure proper database mocking:

```javascript
// Mock the entire database module
jest.mock('../database', () => ({
  withDatabase: jest.fn()
}));

// Implement specific mock behavior
withDatabase.mockImplementation(async (callback) => {
  const mockPrisma = {
    user: { findUnique: jest.fn().mockResolvedValue(mockUser) }
  };
  return callback(mockPrisma);
});
```

## Test Coverage Goals

- **Unit Tests**: >90% code coverage
- **Integration Tests**: All major API flows
- **Error Cases**: All error conditions
- **Security Tests**: All authorization paths
- **Performance Tests**: Critical queries and mutations

## Reporting

### Coverage Reports

Generate coverage reports:

```bash
npm test -- --coverage --coverageReporters=html
open coverage/lcov-report/index.html
```

### Test Results

Track test metrics:
- Pass/fail rates
- Coverage percentages
- Performance benchmarks
- Error detection rates

This comprehensive testing strategy ensures the GraphQL API is reliable, secure, and performant for the Traveller RPG platform.