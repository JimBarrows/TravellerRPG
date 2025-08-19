# Portrait System Test Suite

This directory contains comprehensive tests for the Portrait System implementation in the Traveller RPG project. The test suite provides extensive coverage across service layer, component layer, integration scenarios, error handling, performance, and accessibility.

## Test Structure

### Unit Tests
- **`portraitService.test.ts`** - Complete unit test coverage for the portrait service
  - AWS S3 integration (presigned URLs, uploads)
  - Image processing (resize, thumbnail generation)
  - DiceBear avatar generation
  - Validation and error handling
  - Resource management

### Component Tests
- **`PortraitStep.test.tsx`** - Comprehensive component testing
  - Rendering in all states
  - User interactions
  - Form integration
  - Portrait type selection
  - File validation
  - Image cropping

### Integration Tests
- **`PortraitStep.integration.test.tsx`** - End-to-end workflow testing
  - Complete avatar generation flow
  - Full upload workflow (development and production)
  - Cross-feature integration
  - Resource cleanup
  - Performance optimization

### Error Handling Tests
- **`PortraitStep.errorHandling.test.tsx`** - Comprehensive error scenarios
  - File validation edge cases
  - Network and service errors
  - Browser compatibility issues
  - Memory management
  - Data sanitization

### Performance & Accessibility Tests
- **`PortraitStep.performance.test.tsx`** - Performance and accessibility compliance
  - Component performance benchmarks
  - Large file handling
  - WCAG 2.1 AA compliance
  - Keyboard navigation
  - Screen reader support
  - Touch accessibility

## Test Utilities

### Mock Services
- **`portraitServiceMock.ts`** - Comprehensive mocking for portrait service
- **`testUtils.tsx`** - Common testing utilities and helpers

### Utilities Provided
- Form wrappers for React Hook Form
- Mock character data generation
- File mocking utilities
- Browser API mocks (FileReader, Canvas, URL)
- Environment mocking
- Performance measurement tools
- Accessibility testing helpers

## Running Tests

### All Portrait System Tests
```bash
npm run test src/features/character/services/__tests__/portraitService.test.ts
npm run test src/features/character/components/CharacterCreation/steps/__tests__/
```

### Specific Test Categories
```bash
# Unit tests only
npm run test portraitService.test.ts

# Component tests only
npm run test PortraitStep.test.tsx

# Integration tests only
npm run test PortraitStep.integration.test.tsx

# Error handling tests
npm run test PortraitStep.errorHandling.test.tsx

# Performance tests
npm run test PortraitStep.performance.test.tsx
```

### With Coverage
```bash
npm run test:coverage
```

### With UI
```bash
npm run test:ui
```

## Test Coverage Goals

| Category | Target Coverage | Test Cases |
|----------|----------------|------------|
| portraitService.ts | 100% | 25+ unit tests |
| PortraitStep.tsx | 95% | 30+ component tests |
| Integration flows | 90% | 15+ integration tests |
| Error scenarios | 100% | 20+ error tests |
| Performance/A11y | 85% | 20+ specialized tests |

## Key Features Tested

### Portrait Service
- ✅ Presigned URL generation
- ✅ S3 upload functionality
- ✅ Image validation (type, size)
- ✅ Image processing (resize, crop)
- ✅ DiceBear avatar generation
- ✅ Error handling and recovery
- ✅ Resource cleanup

### Portrait Component
- ✅ Portrait type selection (upload vs avatar)
- ✅ Avatar style selection and preview
- ✅ File upload with drag & drop
- ✅ Image cropping interface
- ✅ Real-time validation feedback
- ✅ Loading states and progress
- ✅ Error display and recovery

### Integration Scenarios
- ✅ Development vs production environments
- ✅ Form state synchronization
- ✅ Character data integration
- ✅ Memory and resource management
- ✅ Concurrent operations handling

### Error Handling
- ✅ Invalid file types and sizes
- ✅ Network failures and timeouts
- ✅ Service unavailability
- ✅ Browser compatibility issues
- ✅ Memory pressure scenarios
- ✅ Malformed data handling

### Performance & Accessibility
- ✅ Component render performance
- ✅ Large file processing
- ✅ Memory leak prevention
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ High contrast support
- ✅ Reduced motion preferences

## Mock Implementations

### AWS S3 Mocking
- Presigned URL generation
- Upload success/failure scenarios
- Network timeout simulation
- Authentication errors

### DiceBear API Mocking
- Avatar URL generation
- Service downtime scenarios
- Invalid parameter handling

### Browser API Mocking
- FileReader operations
- Canvas 2D context
- URL object manipulation
- LocalStorage interactions

## Environment Configuration

Tests are configured to run in both development and production modes:

- **Development**: Local file handling, mock services
- **Production**: Full AWS integration, real service calls (mocked in tests)

## Dependencies

### Testing Framework
- Vitest - Test runner and assertions
- @testing-library/react - Component testing utilities
- @testing-library/user-event - User interaction simulation
- @testing-library/jest-dom - DOM assertions

### Mocking
- MSW (Mock Service Worker) - Network request mocking
- Vitest mocking utilities - Function and module mocking

### Accessibility
- Built-in accessibility testing utilities
- ARIA compliance checks
- Keyboard navigation testing

## Best Practices

### Test Organization
- One test file per source file for unit tests
- Separate integration test files for workflows
- Specialized files for error handling and performance
- Shared utilities for common patterns

### Mock Strategy
- Mock external services (AWS, DiceBear)
- Mock browser APIs for consistent testing
- Provide realistic mock implementations
- Test both success and failure scenarios

### Assertion Strategy
- Test behavior, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Verify accessibility attributes
- Check error states and recovery

### Performance Testing
- Measure critical path performance
- Test with realistic file sizes
- Verify resource cleanup
- Check memory usage patterns

## Continuous Integration

Tests are designed to run reliably in CI environments:
- No dependency on external services
- Consistent mock implementations
- Deterministic timing
- Cross-browser compatibility

## Maintenance

### Adding New Tests
1. Follow existing patterns in test files
2. Use shared utilities from `testUtils.tsx`
3. Add appropriate mocks for new dependencies
4. Update coverage expectations

### Updating Mocks
1. Keep mocks synchronized with real service behavior
2. Test both success and failure paths
3. Maintain realistic response times
4. Document mock limitations

### Performance Baselines
1. Update performance benchmarks when adding features
2. Document expected performance characteristics
3. Monitor for performance regressions
4. Optimize critical paths