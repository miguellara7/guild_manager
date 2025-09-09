# Tibia Guild Manager - Mobile App

## 📱 Overview

The Tibia Guild Manager mobile application provides full guild monitoring capabilities on Android and iOS devices. Built with React Native and Expo, it offers real-time guild tracking, enemy monitoring, death notifications, and subscription management.

## ✨ Features

### 🔐 Authentication
- **Character-based login** with guild password
- **Secure token storage** using Expo SecureStore
- **Auto-login persistence** for seamless experience

### 📊 Dashboard
- **Real-time statistics** for guild members and enemies
- **Quick actions** for sync, purchases, and settings
- **Beautiful metrics cards** with visual indicators

### 👥 Guild Management
- **Member tracking** with online/offline status
- **Enemy monitoring** with threat level indicators
- **Death tracking** with detailed kill information
- **Multi-world support** for comprehensive monitoring

### 💳 Subscription System
- **Purchase tickets** creation with Tibia Coins
- **Subscription status** tracking and management
- **Seamless web integration** for payment completion

### ⚙️ Settings & Configuration
- **Guild configurations** management
- **World subscriptions** overview
- **Profile and notifications** settings

### 👑 Admin Panel (Super Admin)
- **Business metrics** and revenue tracking
- **Payment ticket management** with approve/reject
- **User and subscription** analytics

## 🛠 Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: React Hooks + Context
- **Storage**: Expo SecureStore + AsyncStorage
- **API Integration**: RESTful API with error handling
- **UI Components**: Custom components with Ionicons
- **TypeScript**: Full type safety

## 📱 Screens Structure

```
src/
├── navigation/
│   ├── AppNavigator.tsx        # Main app navigation
│   ├── AuthNavigator.tsx       # Authentication flow
│   ├── MainNavigator.tsx       # Main app tabs
│   ├── AdminNavigator.tsx      # Super Admin panel
│   └── [Feature]Navigator.tsx  # Feature-specific navigation
├── screens/
│   ├── auth/
│   │   ├── WelcomeScreen.tsx   # Landing page with pricing
│   │   └── LoginScreen.tsx     # Character login
│   ├── dashboard/
│   │   └── DashboardScreen.tsx # Main dashboard
│   ├── online/
│   │   └── OnlineScreen.tsx    # Online players monitoring
│   ├── members/
│   │   └── MembersScreen.tsx   # Guild members management
│   ├── enemies/
│   │   └── EnemiesScreen.tsx   # Enemy tracking
│   ├── deaths/
│   │   └── DeathsScreen.tsx    # Death tracking
│   ├── settings/
│   │   ├── SettingsScreen.tsx  # Main settings
│   │   ├── SubscriptionScreen.tsx # Subscription management
│   │   └── GuildSettingsScreen.tsx # Guild configurations
│   └── admin/
│       └── AdminDashboardScreen.tsx # Super Admin panel
├── services/
│   ├── auth.ts                 # Authentication service
│   └── api.ts                  # API communication
└── types/
    └── index.ts                # TypeScript definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Navigate to mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

4. **Run on device/emulator**:
   - **Android**: `npx expo run:android`
   - **iOS**: `npx expo run:ios`
   - **Web**: `npx expo start --web`

### Configuration

Update the API base URL in `src/services/api.ts` and `src/services/auth.ts`:

```typescript
const API_BASE_URL = 'http://YOUR_SERVER_IP:3000';
```

## 📋 API Integration

The mobile app connects to the same backend as the web application:

### Main Endpoints
- `POST /api/auth/signin` - Character authentication
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/guild/online-monitoring` - Online players
- `GET /api/guild/members` - Guild members
- `GET /api/guild/enemies` - Enemy players
- `GET /api/guild/deaths` - Death tracking
- `GET /api/subscription/status` - Subscription info
- `GET /api/guild/guild-configurations` - Guild settings

### Admin Endpoints (Super Admin only)
- `GET /api/admin/business-metrics` - Business analytics
- `GET /api/admin/pending-payments` - Payment tickets
- `POST /api/admin/approve-payment` - Approve payments
- `POST /api/admin/reject-payment` - Reject payments

## 💰 Purchase Flow

1. **User views pricing** on Welcome screen
2. **Clicks "Purchase Subscription"** in Dashboard or Settings
3. **Redirected to web version** for ticket creation
4. **Completes payment** by sending Tibia Coins to "Guild Manacoins"
5. **Super Admin approves** payment in Admin panel
6. **Subscription activated** automatically

## 🔐 Authentication System

### User Types
- **Guild Members**: Use character name + guild password
- **Allied Members**: Use character name + guild password (set by Guild Master)
- **Guild Masters**: Full access to guild management
- **Super Admins**: Access to business panel and payment management

### Security Features
- **JWT tokens** stored securely with Expo SecureStore
- **Auto-refresh** user data on app launch
- **Secure logout** with token cleanup

## 📱 Platform-Specific Features

### Android
- **Material Design** components integration
- **Hardware back button** support
- **Deep linking** for purchase flows

### iOS
- **iOS-specific** navigation patterns
- **Safe area** handling for notched devices
- **Haptic feedback** for interactions

## 🎨 UI/UX Design

### Design System
- **Primary Color**: #0066cc (Tibia blue)
- **Success Color**: #00cc66 (Green)
- **Warning Color**: #ff6600 (Orange)
- **Error Color**: #cc0066 (Red)

### Components
- **Cards**: Rounded corners with shadows
- **Buttons**: Consistent styling with icons
- **Navigation**: Bottom tabs with icons
- **Forms**: Clean inputs with validation

## 🔄 State Management

### Authentication State
- Managed by `AuthService` with persistent storage
- Auto-refresh on app launch
- Secure token management

### API State
- Centralized in `ApiService`
- Error handling and retry logic
- Loading states for all requests

## 📊 Performance

### Optimization Techniques
- **Lazy loading** of screens
- **Image optimization** with proper sizing
- **List virtualization** for large datasets
- **Efficient re-renders** with React.memo

### Memory Management
- **Proper cleanup** of listeners and timers
- **Optimized images** and assets
- **Minimal state** in components

## 🚀 Deployment

### Development
```bash
npx expo start --dev-client
```

### Production Build
```bash
# Android
npx expo build:android --type apk

# iOS (requires macOS)
npx expo build:ios --type archive
```

### Over-the-Air Updates
```bash
npx expo publish
```

## 🔧 Troubleshooting

### Common Issues

1. **Metro bundler issues**:
   ```bash
   npx expo start --clear
   ```

2. **Node modules conflicts**:
   ```bash
   rm -rf node_modules && npm install
   ```

3. **iOS simulator issues**:
   ```bash
   npx expo run:ios --device
   ```

### Debug Mode
Enable debug mode in `src/services/api.ts` for detailed logging:

```typescript
const DEBUG = __DEV__;
```

## 📈 Future Enhancements

- **Push notifications** for death alerts
- **Offline mode** with local storage
- **Dark theme** support
- **Biometric authentication**
- **Widget support** for quick stats
- **Apple Watch / Wear OS** companion apps

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both platforms
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Tibia Guild Manager Mobile** - Your guild, always in your pocket! 📱⚔️
