# FRC Game Prediction - Technical Architecture Documentation

This document explains the complex technical components of the FRC Game Prediction application, including the machine learning model, backend/frontend integration, data flow, and system architecture.

## Table of Contents

1. [System Overview](#system-overview)
2. [Machine Learning Model](#machine-learning-model)
3. [Data Fetching & API Integration](#data-fetching--api-integration)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend/Frontend Integration](#backendfrontend-integration)
6. [State Management](#state-management)
7. [Prediction Algorithm](#prediction-algorithm)
8. [Authentication Flow](#authentication-flow)
9. [Data Flow Diagrams](#data-flow-diagrams)

---

## System Overview

The FRC Game Prediction application is a **Next.js 16** web application that uses machine learning to predict FRC (First Robotics Competition) match outcomes. The system integrates with The Blue Alliance (TBA) API to fetch real-time team statistics and uses a client-side linear regression model to make predictions.

### Key Technologies
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **ML Framework**: Custom linear regression implementation (client-side)
- **Data Source**: The Blue Alliance API v3
- **Storage**: Browser localStorage (client-side persistence)
- **UI Framework**: Tailwind CSS, Radix UI components

---

## Machine Learning Model

### Model Type: Linear Regression

The application uses a **multi-feature linear regression model** trained on FRC team statistics. Unlike traditional server-side ML models, this model runs entirely in the browser using JavaScript.

### Model Architecture

#### Features (Input Variables)
The model uses the following team statistics as features:

1. **OPR (Offensive Power Rating)** - Weight: 0.65
   - Most important metric
   - Represents a team's offensive contribution to alliance scores
   - Typically ranges from 10-80 for individual teams

2. **Average Score** - Weight: 0.35
   - Average alliance score across all matches
   - Secondary indicator of performance

3. **Win Rate** - Weight: 0.15
   - Percentage of matches won
   - Indicates consistency and reliability

4. **DPR (Defensive Power Rating)** - Weight: -0.08
   - Defensive contribution (negative weight as it reduces opponent scores)

5. **CCWM (Calculated Contribution to Winning Margin)** - Weight: 0.25
   - Overall contribution metric combining offense and defense

6. **Bias Term** - Weight: 8.0
   - Base adjustment factor

### Training Process

The model training happens in `lib/ml-model.ts` via the `trainModel()` function:

```typescript
// Training Steps:
1. Fetch data for 25 top FRC teams (training set)
2. Extract features: avgScore, winRate, OPR, DPR, CCWM
3. Initialize weights with optimized values
4. Run gradient descent for 2000 epochs
5. Calculate accuracy and mean squared error
6. Save model to localStorage
```

#### Gradient Descent Algorithm

```typescript
for each epoch (0 to 2000):
  for each team in training data:
    predicted = predictTeamScore(team, weights)
    error = predicted - actual
    totalError += error²
    
    // Calculate gradients
    gradients.avgScore += error * team.avgScore
    gradients.winRate += error * team.winRate * 100
    gradients.opr += error * team.opr
    // ... (similar for other features)
  
  // Update weights using learning rate (0.001)
  weights.feature -= (learningRate * gradients.feature) / trainingData.length
```

#### Model Persistence

The trained model is stored in browser `localStorage` with the following structure:

```json
{
  "weights": {
    "avgScore": 0.35,
    "winRate": 0.15,
    "opr": 0.65,
    "dpr": -0.08,
    "ccwm": 0.25,
    "bias": 8.0
  },
  "accuracy": 91.0,
  "avgError": 12.5,
  "teamsAnalyzed": 25,
  "season": 2024,
  "trainedAt": "2024-01-15T10:30:00.000Z"
}
```

### Prediction Function

The `predictTeamScore()` function calculates a team's predicted contribution:

```typescript
function predictTeamScore(team: TeamStats, weights: ModelWeights): number {
  // Primary prediction using OPR (most reliable metric)
  if (opr > 0) {
    consistencyFactor = 1.0 + (winRate - 0.5) * 0.2
    performanceFactor = 1.0 + min(ccwm / 50, 0.15)
    prediction = opr * consistencyFactor * performanceFactor
    
    // Blend with avgScore if significantly different
    if (abs(avgScore - opr) > 5) {
      prediction = prediction * 0.85 + avgScore * 0.15
    }
    
    return clamp(prediction, 5, 100)
  }
  
  // Fallback if no OPR available
  return avgScore * (0.7 + winRate * 0.3)
}
```

---

## Data Fetching & API Integration

### The Blue Alliance API

The application integrates with **The Blue Alliance (TBA) API v3** to fetch real-time FRC team data.

#### API Endpoints Used

1. **Team Information**
   - `GET /team/frc{teamNumber}` - Basic team info (nickname, location, rookie year)

2. **Team Events**
   - `GET /team/frc{teamNumber}/events/{year}` - List of events for a season

3. **Event Statistics**
   - `GET /event/{eventKey}/oprs` - OPR, DPR, CCWM for all teams in an event
   - `GET /team/frc{teamNumber}/event/{eventKey}/status` - Team ranking and record
   - `GET /team/frc{teamNumber}/event/{eventKey}/matches` - Match results and scores

4. **Historical Data**
   - `GET /team/frc{teamNumber}/awards` - Team awards and achievements

#### Data Fetching Strategy

The `fetchTeamData()` function in `lib/ml-model.ts` implements a comprehensive data aggregation strategy:

```typescript
1. Fetch team basic info
2. Fetch all events for the season
3. For each event:
   - Fetch OPR/DPR/CCWM data
   - Fetch match results
   - Calculate average scores
   - Track wins/losses/ties
   - Get ranking information
4. Aggregate statistics across all events
5. Fetch historical data (last 5 years)
6. Return comprehensive TeamStats object
```

#### Rate Limiting

The code includes rate limiting protection:
- 50-100ms delays between API calls
- Sequential processing to avoid overwhelming the API
- Error handling for failed requests

#### Data Structure

```typescript
interface TeamStats {
  teamNumber: number
  nickname: string
  avgScore: number        // Average alliance score
  winRate: number         // Win percentage (0-1)
  matchesPlayed: number
  ranking: number         // Best ranking across events
  opr: number            // Offensive Power Rating
  dpr: number            // Defensive Power Rating
  ccwm: number           // Calculated Contribution to Winning Margin
  city?: string
  state_prov?: string
  country?: string
  rookie_year?: number
  website?: string
  historicalStats?: {
    years: number[]
    avgScores: number[]
    winRates: number[]
    totalWins: number
    totalLosses: number
    totalTies: number
    championships: number
    awards: any[]
    eventsPlayed: number
  }
  recentEvents?: Array<{
    year: number
    eventKey: string
    eventName: string
    ranking: number
    wins: number
    losses: number
    ties: number
    opr: number
  }>
}
```

---

## Frontend Architecture

### Next.js App Router Structure

```
app/
├── layout.tsx          # Root layout with metadata
├── page.tsx            # Landing/login page
├── dashboard/
│   └── page.tsx        # Dashboard with stats and predictions
├── predictor/
│   └── page.tsx        # Main prediction interface
└── team-info/
    └── page.tsx        # Team search and details
```

### Component Architecture

#### Page Components (Client-Side)

All pages use `"use client"` directive, making them React Client Components:

1. **Home Page** (`app/page.tsx`)
   - Authentication UI (login/signup)
   - Password strength validation
   - API key collection
   - LocalStorage-based auth simulation

2. **Predictor Page** (`app/predictor/page.tsx`)
   - Model training interface
   - Team input (Red/Blue alliances)
   - Prediction execution
   - Results display

3. **Dashboard Page** (`app/dashboard/page.tsx`)
   - Model statistics
   - Prediction history
   - Win distribution charts
   - Quick actions

4. **Team Info Page** (`app/team-info/page.tsx`)
   - Team search functionality
   - Comprehensive team statistics display
   - Historical data visualization

### UI Components

Located in `components/ui/`:
- **Button** - Styled button component
- **Card** - Container component with backdrop blur
- **Input** - Form input with dark theme
- **Select** - Dropdown selector

All components use Tailwind CSS with a dark theme and purple accent colors.

---

## Backend/Frontend Integration

### Client-Side Architecture

**Important**: This application runs entirely in the browser. There is no traditional backend server. All processing happens client-side:

1. **API Calls**: Made directly from the browser to TBA API
2. **ML Training**: Runs in the browser using JavaScript
3. **Data Storage**: Uses browser localStorage
4. **Authentication**: Simulated using localStorage (not production-ready)

### Data Flow

```
User Action
    ↓
React Component (Frontend)
    ↓
ML Model Functions (lib/ml-model.ts)
    ↓
TBA API (External)
    ↓
Data Processing & Aggregation
    ↓
Model Training/Prediction
    ↓
Results Display (Frontend)
    ↓
localStorage (Persistence)
```

### API Key Management

- API keys are stored in `localStorage` as `tba_api_key`
- Keys are required for all TBA API requests
- Keys are collected during signup/login
- Keys are passed to all ML model functions

### Error Handling

The system includes comprehensive error handling:

```typescript
try {
  // API call or model operation
} catch (error) {
  if (error.message.includes("API key") || error.status === 401) {
    // Authentication error - don't use fallback data
    throw error
  } else {
    // Other errors - return fallback data
    return fallbackTeamStats
  }
}
```

---

## State Management

### Local Storage Schema

The application uses browser `localStorage` for persistence:

| Key | Purpose | Structure |
|-----|---------|-----------|
| `tba_api_key` | TBA API authentication | `string` |
| `user_email` | Current user email | `string` |
| `is_authenticated` | Auth status | `"true"` or `"false"` |
| `user_{email}` | User account data | `{email, password, apiKey, createdAt}` |
| `ml_model` | Trained model weights | `{weights, accuracy, avgError, teamsAnalyzed, season, trainedAt}` |
| `predictions` | Prediction history | `Array<{timestamp, redTeams, blueTeams, result}>` |

### React State Management

Each page component manages its own local state using React hooks:

- `useState` - Component-level state
- `useEffect` - Side effects (API calls, localStorage sync)
- `useRouter` - Navigation (Next.js)

### State Synchronization

The application synchronizes state between:
1. React component state
2. Browser localStorage
3. External API responses

Example from Predictor Page:
```typescript
useEffect(() => {
  const modelData = localStorage.getItem("ml_model")
  if (modelData) {
    const parsed = JSON.parse(modelData)
    if (parsed.season === currentSeason) {
      setModelTrained(true)
    } else {
      // Retrain for new season
      trainModel(apiKey, currentSeason)
    }
  }
}, [season])
```

---

## Prediction Algorithm

### Match Prediction Process

The `makePrediction()` function in `lib/ml-model.ts` implements a sophisticated prediction algorithm:

#### Step 1: Fetch Team Data
```typescript
redData = await Promise.all(redTeams.map(t => fetchTeamData(apiKey, t, year)))
blueData = await Promise.all(blueTeams.map(t => fetchTeamData(apiKey, t, year)))
```

#### Step 2: Calculate Base Alliance OPR
```typescript
redBaseOPR = sum(redData.map(team => team.opr))
blueBaseOPR = sum(blueData.map(team => team.opr))
```

#### Step 3: Calculate Synergy Factors
Alliance synergy accounts for how well teams work together:

```typescript
redAvgWinRate = average(redData.map(team => team.winRate))
redAvgCCWM = average(redData.map(team => team.ccwm))

redSynergy = 1.0 + (redAvgWinRate * 0.15) + (min(redAvgCCWM, 20) / 100)
```

#### Step 4: Apply Synergy to Base OPR
```typescript
redScore = redBaseOPR * redSynergy * 1.25  // 1.25x multiplier for coordination
blueScore = blueBaseOPR * blueSynergy * 1.25
```

#### Step 5: Adjust for Consistency
```typescript
redConsistency = average(redData.map(team => 
  team.winRate * 0.3 + (team.matchesPlayed > 10 ? 0.1 : 0)
))

redScore *= (1.0 + redConsistency * 0.1)
```

#### Step 6: Add Variance
```typescript
variance = 0.05  // ±5% random variance
redScore *= (1 + (Math.random() - 0.5) * variance * 2)
```

#### Step 7: Calculate Win Probabilities
Uses a sigmoid function for probability calculation:

```typescript
scoreDiff = redScore - blueScore
avgScore = (redScore + blueScore) / 2
sigmoidDivisor = max(8, avgScore * 0.08)  // Adaptive scaling

redWinProb = 1 / (1 + exp(-scoreDiff / sigmoidDivisor))
blueWinProb = 1 - redWinProb
```

#### Step 8: Calculate Confidence
```typescript
scoreDiffPercent = abs(scoreDiff) / max(avgScore, 1) * 100
confidence = abs(redWinProb - blueWinProb) * 100

// Boost confidence for consistent teams and clear differences
if (scoreDiffPercent > 5) {
  consistencyBoost = avgConsistency * 0.15
  scoreDiffBoost = min(0.3, scoreDiffPercent / 100 * 0.4)
  confidence = min(92, confidence + (consistencyBoost + scoreDiffBoost) * 100)
}
```

### Prediction Result Structure

```typescript
{
  redScore: number              // Predicted red alliance score
  blueScore: number            // Predicted blue alliance score
  redWinProbability: number    // Red win probability (0-100)
  blueWinProbability: number   // Blue win probability (0-100)
  winner: "red" | "blue"       // Predicted winner
  confidence: number           // Prediction confidence (0-100)
  redTeamData: TeamStats[]     // Full data for red teams
  blueTeamData: TeamStats[]    // Full data for blue teams
}
```

---

## Authentication Flow

### Current Implementation (Demo)

The application uses a **simulated authentication system** stored in localStorage. This is **not production-ready** and should be replaced with a proper backend authentication system.

#### Sign Up Flow

```
1. User enters email, password, TBA API key
2. Password strength validation (5 levels)
3. Password confirmation check
4. API key format validation (min 20 characters)
5. Store in localStorage:
   - user_{email}: {email, encodedPassword, apiKey, createdAt}
   - tba_api_key: apiKey
   - user_email: email
   - is_authenticated: "true"
6. Redirect to /dashboard
```

#### Login Flow

```
1. User enters email and password
2. Check localStorage for user_{email}
3. Compare encoded passwords (btoa encoding)
4. If match:
   - Set tba_api_key from stored user data
   - Set user_email and is_authenticated
   - Redirect to /dashboard
5. If no match: Show error
```

#### Authentication Guards

All protected pages check for API key:

```typescript
useEffect(() => {
  const apiKey = localStorage.getItem("tba_api_key")
  if (!apiKey) {
    router.push("/")  // Redirect to login
  }
}, [router])
```

### Production Recommendations

For production, implement:
1. **Backend API** (Node.js/Express, Python/Flask, etc.)
2. **JWT Authentication** with secure token storage
3. **Password Hashing** (bcrypt, argon2)
4. **Session Management** with httpOnly cookies
5. **API Key Encryption** before storage
6. **Rate Limiting** on API endpoints

---

## Data Flow Diagrams

### Model Training Flow

```
User clicks "Train Model"
    ↓
trainModel(apiKey, season)
    ↓
Fetch data for 25 training teams (sequential)
    ↓
For each team:
  - fetchTeamData() → TBA API
  - Aggregate stats across events
  - Calculate OPR, DPR, CCWM
    ↓
Initialize model weights
    ↓
Gradient Descent (2000 epochs):
  - Calculate predictions
  - Compute errors
  - Update weights
    ↓
Calculate accuracy & MSE
    ↓
Save to localStorage
    ↓
Update UI: setModelTrained(true)
```

### Prediction Flow

```
User enters 6 team numbers (3 red, 3 blue)
    ↓
User clicks "Predict Winner"
    ↓
makePrediction(apiKey, redTeams, blueTeams, season)
    ↓
Load model from localStorage
    ↓
Fetch data for all 6 teams (parallel):
  - fetchTeamData() for each team
    ↓
Calculate alliance scores:
  - Sum individual OPRs
  - Apply synergy factors
  - Adjust for consistency
  - Add variance
    ↓
Calculate win probabilities (sigmoid)
    ↓
Calculate confidence
    ↓
Return prediction result
    ↓
Display results in UI
    ↓
Save to localStorage (prediction history)
```

### Team Data Fetching Flow

```
fetchTeamData(apiKey, teamNumber, season)
    ↓
Fetch team basic info: /team/frc{number}
    ↓
Fetch events: /team/frc{number}/events/{year}
    ↓
For each event (sequential with delays):
  ├─ Fetch OPR data: /event/{key}/oprs
  ├─ Fetch matches: /team/frc{number}/event/{key}/matches
  ├─ Fetch status: /team/frc{number}/event/{key}/status
  └─ Calculate event stats
    ↓
Aggregate across all events:
  - Average scores
  - Total wins/losses/ties
  - Average OPR/DPR/CCWM
  - Best ranking
    ↓
Fetch historical data:
  - Awards: /team/frc{number}/awards
  - Recent events (last 3 years)
    ↓
Return comprehensive TeamStats object
```

---

## Key Design Decisions

### Why Client-Side ML?

1. **No Backend Required**: Reduces infrastructure costs
2. **Privacy**: Team data never leaves the user's browser
3. **Real-Time**: No server round-trips for predictions
4. **Scalability**: No server load for ML computations

### Why Linear Regression?

1. **Simplicity**: Easy to understand and debug
2. **Interpretability**: Weights show feature importance
3. **Speed**: Fast training and prediction
4. **Sufficient Accuracy**: ~91% accuracy for FRC predictions

### Why localStorage?

1. **No Backend**: Client-side storage needed
2. **Persistence**: Data survives page refreshes
3. **Simplicity**: No database setup required

**Limitations**: 
- Data is browser-specific (not synced across devices)
- Limited storage (~5-10MB)
- Not secure for sensitive data

---

## Performance Considerations

### Optimization Strategies

1. **Parallel API Calls**: Use `Promise.all()` for independent requests
2. **Rate Limiting**: Delays between sequential API calls
3. **Caching**: Model stored in localStorage (no retraining needed)
4. **Lazy Loading**: Components load on demand
5. **Error Handling**: Fallback data prevents crashes

### Known Limitations

1. **API Rate Limits**: TBA API has rate limits (mitigated with delays)
2. **Training Time**: ~30-60 seconds for 25 teams
3. **Browser Storage**: localStorage size limits
4. **No Real-Time Updates**: Data fetched on-demand, not live

---

## Future Enhancements

### Recommended Improvements

1. **Backend API**: Move ML training to server for better performance
2. **Database**: Replace localStorage with proper database
3. **Real-Time Updates**: WebSocket integration for live match data
4. **Advanced ML**: Neural networks or ensemble methods
5. **Caching Layer**: Redis for API response caching
6. **User Accounts**: Proper authentication and user management
7. **Prediction History**: Database-backed prediction tracking
8. **Analytics**: Track prediction accuracy over time

---

## Conclusion

This FRC Game Prediction application demonstrates a complete client-side machine learning system integrated with external APIs. While the current implementation is functional for demonstration purposes, production deployment would benefit from a proper backend architecture for security, scalability, and data persistence.

For questions or contributions, please refer to the main README.md file.

