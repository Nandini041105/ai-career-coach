# AI-Powered Career Coach — Native Mobile Application

> **Autonomous Career Engineering Suite on Smartphones**  
> *React Native (Expo) • iOS & Android • ATS Scorecard • Job Matcher • AI Mock Interview Coach*

---

## Overview

This is the dedicated **Native Mobile Application** for **AI-Powered Career Coach**, engineered with **React Native** and **Expo SDK 57**. It provides an optimized, thumb-friendly mobile experience tailored for engineering students and job seekers on iOS and Android devices.

---

## Mobile Features

### 1. Mobile Authentication & Discipline Personalization
- Clean mobile sign-in & registration.
- Engineering track selector: **RTL Design Engineer**, **FPGA Design Engineer**, **VLSI / ASIC Engineer**, **Physical Design**, **Embedded Systems**, **Software Engineer**, and **Data / AI**.
- Offline JWT session persistence via `@react-native-async-storage/async-storage`.

### 2. Resume Upload & PDF Parsing
- Integrated native document picker (`expo-document-picker`) to pick PDF resumes directly from Android / iOS device storage, Downloads, Google Drive, or iCloud.
- Automatic multipart file upload to the backend Express server with parsing for skills, experience, and quantifiable metrics.

### 3. Comprehensive 8-Point ATS Scorecard
- Radial Score Ring (0–100) with color grading (Emerald, Sky Blue, Amber, Rose).
- 8-category breakdown: Technical Skills, Engineering Projects, Work Experience, Academic Credentials, Domain Keywords, Quantifiable Achievements, Structure, and Role Relevance.
- Action verb analyzer (identifying strong active verbs vs. weak passive phrases).
- Quantifiable metric counter.
- AI before-and-after bullet rewrites with engineering rationale.

### 4. Job Description Matcher & Skill Gap Discovery
- Mobile job description input with auto-fill sample technical JD.
- Weighted ATS matching calculation.
- Matched skills badges (green checkmarks) vs. missing skill gaps (warning badges).

### 5. 4-Week Learning Roadmap
- Prioritized step-by-step technical milestone curriculum.
- Weekly themes (Fundamentals, Architecture & Protocols, Optimization & CDC, Capstone & Interview Defense).
- Interactive milestone checklists.

### 6. Interactive AI Mock Interview Practice
- Assessment mode selection: Technical Depth, Behavioral (STAR), or Mixed.
- Live question card with category tags and progress indicator.
- Candidate response input with native keyboard voice dictation support.
- **Instant Rubric Evaluation**:
  - Score (1–10)
  - Strengths in candidate's response
  - Actionable points for improvement
  - Complete AI benchmark model answer
- Final session scorecard with question-by-question review.

### 7. LAN Backend Connectivity Manager
- Dynamic API Base URL configuration: easily switch between Wi-Fi LAN IP (e.g. `http://10.178.125.122:5000/api`), `http://localhost:5000/api`, or cloud backend.
- One-tap "Test Ping" health check in the Profile tab.

---

## How to Run on Your Physical Smartphone (Expo Go)

### Prerequisites
1. Install **Node.js** (v18+) on your computer.
2. Install the free **Expo Go** app on your phone:
   - [Android Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS Apple App Store](https://apps.apple.com/app/expo-go/id982107779)
3. Ensure your phone and computer are connected to the **same local Wi-Fi network** (or phone mobile hotspot connected to your PC).

### Step 1: Start the Backend API Server
In a terminal window on your PC:
```bash
cd backend
npm start
```
*The server will start on port `5000` and bind to `0.0.0.0` with mobile LAN access at `http://<your-ip>:5000/api`.*

### Step 2: Start the Expo Mobile Development Server
In another terminal window:
```bash
cd mobile
npx expo start
```

### Step 3: Scan the QR Code on Your Phone
- **Android**: Open the **Expo Go** app and tap **"Scan QR code"**, then scan the QR code printed in your terminal.
- **iOS**: Open your iPhone's built-in **Camera** app, point it at the terminal QR code, and tap the notification banner to open in Expo Go.

The app will download the JavaScript bundle and render the native UI on your phone!

---

## Directory Structure

```
mobile/
├── App.js                   # Application entry with SafeArea & Auth Providers
├── app.json                 # Expo app configuration
├── package.json             # Mobile dependencies & scripts
├── src/
│   ├── api/
│   │   └── client.js        # Axios API client with dynamic host IP & JWT interceptor
│   ├── context/
│   │   └── AuthContext.js   # Authentication state & AsyncStorage persistence
│   ├── theme/
│   │   ├── colors.js        # Obsidian dark palette & status colors
│   │   └── index.js         # Spacing, typography, radii, and shadows
│   ├── components/
│   │   ├── Header.js        # Screen header with title, subtitle & role badge
│   │   ├── Button.js        # Touchable button with variants & loading state
│   │   ├── Input.js         # Text input with labels, icons & password toggle
│   │   ├── MetricCard.js    # Metric display card with badges
│   │   ├── ScoreRing.js     # Circular score indicator (0–100)
│   │   └── RolePicker.js    # Horizontal & grid engineering role selector
│   ├── navigation/
│   │   ├── RootNavigator.js # Auth gate & loading splash
│   │   ├── AuthNavigator.js # Login & Register stack
│   │   └── MainTabNavigator.js # Bottom tab navigator (Overview, Resume, Matcher, Interview, Profile)
│   └── screens/
│       ├── auth/
│       │   ├── LoginScreen.js
│       │   └── RegisterScreen.js
│       ├── dashboard/
│       │   └── DashboardScreen.js
│       ├── resume/
│       │   ├── ResumeUploadScreen.js
│       │   └── ResumeScoreScreen.js
│       ├── jobs/
│       │   ├── JobMatcherScreen.js
│       │   └── RoadmapScreen.js
│       ├── interview/
│       │   ├── InterviewHubScreen.js
│       │   ├── MockInterviewScreen.js
│       │   └── InterviewResultsScreen.js
│       └── profile/
│           └── ProfileScreen.js
```
