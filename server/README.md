# Healiofy Backend API

This is the backend API for the Healiofy telemedicine platform built for a hackathon prototype.

## Features

- User authentication (registration and login)
- JWT-based authentication
- MongoDB database integration
- RESTful API design

## Prerequisites

- Node.js (v14 or later)
- MongoDB (local instance or MongoDB Atlas, optional - falls back to in-memory database)

## Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies
```bash
npm install
```
4. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/telemedicine
JWT_SECRET=your-secret-key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## MongoDB Setup

For the hackathon, you have several options:

### Option 1: In-Memory MongoDB (Recommended for Hackathon)
For quick demos and testing, the server will automatically use an in-memory MongoDB instance if it can't connect to the specified database. This requires no additional setup but data will be lost when the server restarts.

### Option 2: MongoDB Atlas
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster
3. Click "Connect" and follow instructions to:
   - Add your IP address to the access list
   - Create a database user
   - Get your connection string
4. Replace the MONGO_URI in .env with your connection string

### Option 3: Local MongoDB
1. Install MongoDB locally
2. Start the MongoDB service
3. Use `mongodb://localhost:27017/telemedicine` as your MONGO_URI

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Authentication

#### Register a New User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "user_id",
      "email": "user@example.com"
    },
    "token": "jwt_token"
  }
  ```

#### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "user_id",
      "email": "user@example.com"
    },
    "token": "jwt_token"
  }
  ```

### Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "message": "Server is running"
  }
  ```

## Testing

For the hackathon demo, use the following test user:
- Email: testuser@example.com
- Password: test1234

## License

This project is part of a hackathon submission and is not licensed for commercial use. 