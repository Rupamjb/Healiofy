const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const { seedTestUser } = require('./utils/seedDB');
const { seedDoctors } = require('./utils/seedDoctors');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://healiofy.vercel.app', 'https://www.healiofy.com', 'https://healiofy.com', 'http://localhost:3000', 'http://localhost:8080']
  : ['http://localhost:3000', 'http://localhost:8080'];

// Configure CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if the origin is allowed or if we're in development
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Max-Age', '86400'); // 24 hours
      return res.status(200).send();
    }
  }
  
  next();
});

// Routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Also add routes without /api prefix for compatibility with frontend calls
app.use('/auth', authRoutes);
app.use('/doctors', doctorRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/prescriptions', prescriptionRoutes);
app.use('/chatbot', chatbotRoutes);
app.use('/subscription', subscriptionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// API health check endpoint (accessible from the frontend)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    // Connect to MongoDB Atlas
    console.log('Connecting to MongoDB Atlas...');
    
    // Connect without deprecated options
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas successfully');
    
    // Seed data for development environment only
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('Seeding test data to database...');
        await seedTestUser();
        await seedDoctors();
        console.log('Database seeding completed');
      } catch (seedError) {
        console.error('Error seeding data:', seedError.message);
      }
    }
    
    // For non-Vercel environments, start a server
    if (!process.env.VERCEL) {
      // Start server - use PORT from environment (Render will set this)
      const PORT = process.env.PORT || 5000;
      const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        
        // Log different information based on environment
        if (process.env.NODE_ENV === 'production') {
          console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
        } else {
          console.log(`API accessible at: http://localhost:${PORT}/api`);
        }
      });
      
      // Handle server errors - important for debugging deployment issues
      server.on('error', (err) => {
        console.error('Server error:', err);
        process.exit(1);
      });
    } else {
      console.log('Running in Vercel serverless environment');
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas:', error.message);
    process.exit(1);
  }
}

// Start server for non-Vercel environments
// In Vercel, this will just connect to MongoDB
startServer();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on the server'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
}); 
