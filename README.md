# Healiofy - Healthcare at Your Fingertips

Healiofy is a modern healthcare platform designed to bridge the gap between patients and their healthcare information. This repository contains both the frontend application and backend server.

## Features

- **Prescription Analysis**: AI-powered analysis of prescriptions 
- **Doctor Directory**: Find and connect with healthcare providers
- **Appointment Booking**: Schedule appointments with doctors
- **AI Health Assistant**: Get answers to your health questions
- **Secure Authentication**: JWT-based protection for your health data

## Project Structure

- `heal/` - Frontend React application 
- `server/` - Backend Node.js/Express server

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (optional, in-memory database is used as fallback)

### Frontend Setup

```bash
# Navigate to frontend directory
cd heal

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend should be accessible at http://localhost:8080 (or another port if 8080 is in use).

### Backend Setup

```bash
# Navigate to backend directory
cd server

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend server will run on http://localhost:5000.

### Environment Variables

#### Frontend (.env file in heal/ directory)
```
VITE_API_URL=http://localhost:5000/api
```

#### Backend (.env file in server/ directory)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/healiofy
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key
```

## Development Notes

- The backend includes a fallback to in-memory MongoDB if a connection to a real MongoDB instance fails.
- Test user credentials: email: `testuser@example.com`, password: `test1234`
- Run both frontend and backend concurrently during development

## Testing

```bash
# Test server API endpoints  
cd server
node utils/testChatbot.js

# Run frontend tests
cd heal
npm test
```

## Deployment

The application is designed to be easily deployed:

1. Build the frontend: `cd heal && npm run build`
2. Set environment variables for production
3. Deploy the frontend static files and backend service

## Troubleshooting

- If port conflicts occur, the application will automatically try to use alternative ports
- If MongoDB connection fails, the application will use an in-memory database
- For server errors, check server logs and ensure environment variables are correctly set

## License

MIT License 

## Subscription System

The telemedicine platform includes a subscription system with a free trial and paid subscription model. The system is integrated with Stellar's Testnet for handling payments using test XLM.

### Features

- **Free Trial**:
  - 3 free prescription analyses
  - Unlimited chatbot access during trial
  - 1 free consultant booking
  - Trial usage tracking in the database

- **Paid Subscription**:
  - 100 test XLM per month (for demo purposes)
  - Unlimited access to all features
  - Freighter wallet integration for secure payments
  - No real money required (uses Stellar Testnet)

- **User Profile**:
  - Subscription status and trial usage display
  - One-click subscription purchase
  - Transaction history

### Setup Instructions

1. **Set up Stellar Platform Account**:
   - Create a Stellar account on the Testnet for the platform to receive payments
   - Add the account public key to your environment variables:
     ```
     STELLAR_PLATFORM_ACCOUNT=your_platform_public_key
     ```

2. **Install Freighter Wallet (for users)**:
   - Install the [Freighter browser extension](https://www.freighter.app/)
   - Configure it to use the Testnet network

3. **Fund Test Accounts**:
   - Use the built-in test account creation feature, or
   - Visit [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test) to create and fund test accounts
   - No real funds are required

### Hackathon Demo Flow

1. Create a new user account to demonstrate the free trial
2. Use the prescription analyzer and consultant booking to show trial usage tracking
3. Attempt to use a feature after trial exhaustion to trigger subscription prompt
4. Create a test Stellar account with the "Create Test Account" button
5. Complete the payment flow with Freighter to show the subscription activation
6. Demonstrate unlimited access to all features post-subscription

### Implementation Notes

- All Stellar operations are performed on the Testnet
- No private keys are stored on the server (Freighter handles signing)
- The system is designed for demonstration purposes only
- In a production environment, additional security measures would be required
