# TravellerMobile BDD Testing Quick Start

## 🚀 Ready to Run Commands

```bash
# 1. Start Metro bundler (in separate terminal)
npm start

# 2. Build and run iOS tests
npm run e2e:run:ios

# 3. Build and run Android tests  
npm run e2e:run:android

# 4. Run specific feature
npx cucumber-js e2e/features/authentication.feature

# 5. Generate HTML report
npm run cucumber:report
```

## 📊 What's Included

**61 BDD Scenarios** across **5 Feature Files**:

### 🔐 Authentication (7 scenarios)
- Login/logout flows
- Registration & verification  
- Biometric authentication
- Security management

### 👤 Character Creation (12 scenarios)
- Mobile wizard interface
- Form validation
- Touch/swipe interactions
- Camera integration

### 📱 Mobile Navigation (15 scenarios)
- Tab bar navigation
- Gesture support (swipe, pinch, long-press)
- Hardware back button
- Accessibility features

### 🔄 Offline Functionality (13 scenarios)
- Offline character access
- Data synchronization
- Conflict resolution
- Network status management

### 🔔 Push Notifications (14 scenarios)
- Campaign invitations
- Session reminders
- Character updates
- Notification settings

## 🛠 Test Infrastructure

- **Framework**: Detox + Cucumber.js
- **Platforms**: iOS Simulator, Android Emulator
- **Reporting**: HTML reports with screenshots
- **Utilities**: Custom helper classes for mobile interactions
- **Data Management**: Centralized test data with generators

## 🏃‍♂️ Running Individual Test Categories

```bash
# Authentication tests only
npx cucumber-js e2e/features --tags "@authentication"

# Critical/smoke tests
npx cucumber-js e2e/features --tags "@smoke or @critical"

# Mobile-specific tests
npx cucumber-js e2e/features --tags "@mobile"

# Offline functionality
npx cucumber-js e2e/features --tags "@offline"

# Gesture interactions
npx cucumber-js e2e/features --tags "@gestures"
```

## 🔧 Troubleshooting

**Build Issues:**
```bash
# Clean iOS build
cd ios && xcodebuild clean
# Clean Android build  
cd android && ./gradlew clean
```

**Simulator Issues:**
```bash
# Reset iOS simulator
xcrun simctl erase all
# Cold boot Android emulator
emulator -avd Pixel_3a_API_30_x86 -cold-boot
```

**Validation:**
```bash
# Check setup
node e2e/support/validate-setup.js
```

## 📈 Success Metrics

✅ **61 comprehensive BDD scenarios** covering mobile-specific functionality  
✅ **Complete step definitions** with mobile gesture support  
✅ **Detox integration** for reliable mobile E2E testing  
✅ **Cross-platform support** (iOS & Android)  
✅ **Rich reporting** with failure screenshots  
✅ **Test utilities** for mobile interactions  
✅ **Offline testing** with network simulation  
✅ **Push notification** testing scenarios  

## 🎯 Next Steps

1. **Run first test**: `npm run e2e:run:ios`
2. **View HTML report**: Open `e2e/reports/cucumber-report.html`
3. **Add new scenarios**: Create feature files in `e2e/features/`
4. **Customize data**: Modify `e2e/support/test-data.js`
5. **Integrate CI/CD**: Add test scripts to your pipeline

The BDD testing framework is now ready for comprehensive mobile testing of your Traveller RPG application! 🎮✨