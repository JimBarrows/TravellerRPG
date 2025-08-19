/**
 * Validation script for Traveller RPG rules implementation
 * Tests the characteristics system for compliance with official rules
 */

import { getCharacteristicModifier, toUPP, getCharacteristicRangeDescription } from '../types/characterSheet';
import type { CharacterCharacteristics } from '../types/characterCreation';

// Test cases for Traveller RPG characteristic modifier rules
export const testCharacteristicModifiers = () => {
  const testCases = [
    // [characteristic value, expected modifier]
    [0, -3],  // Dead
    [1, -2],  // Unconscious/disabled
    [2, -1],  // floor((2-6)/3) = -1
    [3, -1],  // floor((3-6)/3) = -1
    [4, -1],  // floor((4-6)/3) = -1
    [5, -1],  // floor((5-6)/3) = -1
    [6, 0],   // floor((6-6)/3) = 0
    [7, 0],   // floor((7-6)/3) = 0
    [8, 0],   // floor((8-6)/3) = 0
    [9, 1],   // floor((9-6)/3) = 1
    [10, 1],  // floor((10-6)/3) = 1
    [11, 1],  // floor((11-6)/3) = 1
    [12, 2],  // floor((12-6)/3) = 2
    [13, 2],  // floor((13-6)/3) = 2
    [14, 2],  // floor((14-6)/3) = 2
    [15, 3],  // floor((15-6)/3) = 3 (superhuman)
    [16, 3],  // floor((16-6)/3) = 3
    [17, 3],  // floor((17-6)/3) = 3
    [18, 4],  // floor((18-6)/3) = 4
  ] as const;

  const results = testCases.map(([value, expected]) => {
    const calculated = getCharacteristicModifier(value);
    const passed = calculated === expected;
    
    return {
      value,
      expected,
      calculated,
      passed,
      description: `Value ${value}: Expected ${expected}, got ${calculated}`,
    };
  });

  const allPassed = results.every(r => r.passed);
  const failedTests = results.filter(r => !r.passed);

  return {
    allPassed,
    totalTests: results.length,
    passedTests: results.filter(r => r.passed).length,
    failedTests,
    results,
  };
};

// Test UPP (Universal Personality Profile) formatting
export const testUPPFormatting = () => {
  const testCases = [
    {
      characteristics: {
        strength: 8,
        dexterity: 12,
        endurance: 7,
        intelligence: 13,
        education: 11,
        social: 9,
      },
      expected: '8C7DB9', // 8, C(12), 7, D(13), B(11), 9
    },
    {
      characteristics: {
        strength: 15,
        dexterity: 10,
        endurance: 6,
        intelligence: 0,
        education: 1,
        social: 18,
      },
      expected: 'FA601I', // F(15), A(10), 6, 0, 1, I(18)
    },
    {
      characteristics: {
        strength: 6,
        dexterity: 6,
        endurance: 6,
        intelligence: 6,
        education: 6,
        social: 6,
      },
      expected: '666666', // All average
    },
  ] as const;

  const results = testCases.map((testCase, index) => {
    const calculated = toUPP(testCase.characteristics as CharacterCharacteristics);
    const passed = calculated === testCase.expected;
    
    return {
      testIndex: index + 1,
      characteristics: testCase.characteristics,
      expected: testCase.expected,
      calculated,
      passed,
      description: `Test ${index + 1}: Expected "${testCase.expected}", got "${calculated}"`,
    };
  });

  const allPassed = results.every(r => r.passed);
  const failedTests = results.filter(r => !r.passed);

  return {
    allPassed,
    totalTests: results.length,
    passedTests: results.filter(r => r.passed).length,
    failedTests,
    results,
  };
};

// Test characteristic range descriptions
export const testCharacteristicRanges = () => {
  const testCases = [
    [0, 'Dead'],
    [1, 'Unconscious'],
    [2, 'Very Poor'],
    [3, 'Very Poor'],
    [4, 'Poor'],
    [5, 'Poor'],
    [6, 'Average'],
    [7, 'Average'],
    [8, 'Average'],
    [9, 'Good'],
    [10, 'Good'],
    [11, 'Good'],
    [12, 'Excellent'],
    [13, 'Excellent'],
    [14, 'Excellent'],
    [15, 'Superhuman'],
    [16, 'Superhuman'],
    [18, 'Superhuman'],
  ] as const;

  const results = testCases.map(([value, expected]) => {
    const calculated = getCharacteristicRangeDescription(value);
    const passed = calculated === expected;
    
    return {
      value,
      expected,
      calculated,
      passed,
      description: `Value ${value}: Expected "${expected}", got "${calculated}"`,
    };
  });

  const allPassed = results.every(r => r.passed);
  const failedTests = results.filter(r => !r.passed);

  return {
    allPassed,
    totalTests: results.length,
    passedTests: results.filter(r => r.passed).length,
    failedTests,
    results,
  };
};

// Run all validation tests
export const validateTravellerRules = () => {
  console.log('🚀 Running Traveller RPG Rules Validation Tests...\n');

  // Test 1: Characteristic Modifiers
  console.log('📊 Testing Characteristic Modifier Calculations...');
  const modifierTests = testCharacteristicModifiers();
  console.log(`✅ Modifier Tests: ${modifierTests.passedTests}/${modifierTests.totalTests} passed`);
  
  if (!modifierTests.allPassed) {
    console.log('❌ Failed modifier tests:');
    modifierTests.failedTests.forEach(test => console.log(`  - ${test.description}`));
  }
  console.log();

  // Test 2: UPP Formatting
  console.log('🔢 Testing UPP (Universal Personality Profile) Formatting...');
  const uppTests = testUPPFormatting();
  console.log(`✅ UPP Tests: ${uppTests.passedTests}/${uppTests.totalTests} passed`);
  
  if (!uppTests.allPassed) {
    console.log('❌ Failed UPP tests:');
    uppTests.failedTests.forEach(test => console.log(`  - ${test.description}`));
  }
  console.log();

  // Test 3: Range Descriptions
  console.log('📝 Testing Characteristic Range Descriptions...');
  const rangeTests = testCharacteristicRanges();
  console.log(`✅ Range Tests: ${rangeTests.passedTests}/${rangeTests.totalTests} passed`);
  
  if (!rangeTests.allPassed) {
    console.log('❌ Failed range tests:');
    rangeTests.failedTests.forEach(test => console.log(`  - ${test.description}`));
  }
  console.log();

  // Overall results
  const totalTests = modifierTests.totalTests + uppTests.totalTests + rangeTests.totalTests;
  const totalPassed = modifierTests.passedTests + uppTests.passedTests + rangeTests.passedTests;
  const allTestsPassed = modifierTests.allPassed && uppTests.allPassed && rangeTests.allPassed;

  console.log('📋 Overall Results:');
  console.log(`🎯 Total Tests: ${totalPassed}/${totalTests} passed`);
  console.log(`${allTestsPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed'}`);
  
  if (allTestsPassed) {
    console.log('✨ Traveller RPG rules implementation is compliant!');
  } else {
    console.log('🔧 Please review failed tests and fix implementation.');
  }

  return {
    allPassed: allTestsPassed,
    totalTests,
    totalPassed,
    modifierTests,
    uppTests,
    rangeTests,
  };
};

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).validateTravellerRules = validateTravellerRules;
}