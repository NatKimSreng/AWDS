# AngkorWatDayTour — Customer Mobile App

React Native + Expo SDK 54 customer app.

## Tech Stack

- Expo SDK 54 (Expo Router file-based navigation)
- React Native 0.81 / React 19
- NativeWind v4 (Tailwind CSS for RN)
- React Navigation
- EAS Build (development / preview / production)

## Design Tokens

See `tailwind.config.js` for the Angkor Orange palette and typography.

## Getting Started

```bash
cd apps/mobile
cp .env.example .env
npm install
npx expo start
```

For native modules (payments, maps), use a development build:

```bash
npx eas build --profile development --platform android
```

## Project Structure

```
app/           # Expo Router screens
components/    # Shared UI components
constants/     # Config, theme, API helpers
assets/        # Images and fonts
```
