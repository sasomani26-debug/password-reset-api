const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// =============================================
// LOAD SERVICE ACCOUNT FROM ENVIRONMENT VARIABLE
// =============================================
let serviceAccount;
let firebaseInitialized = false;

try {
  // Check if we're on Railway (with env var)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    console.log('📦 Found GOOGLE_APPLICATION_CREDENTIALS_JSON in environment');
    serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    console.log('✅ Service account loaded from Railway environment');
  } else {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set');
  }
} catch (error) {
  console.error('❌ Failed to parse service account JSON:', error.message);
  console.error('Please check that GOOGLE_APPLICATION_CREDENTIALS_JSON is set correctly in Railway variables');
  serviceAccount = null;
}

// =============================================
// INITIALIZE FIREBASE ADMIN
// =============================================
if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized successfully');
    console.log(`📋 Project ID: ${serviceAccount.project_id}`);
    console.log(`📧 Client Email: ${serviceAccount.client_email}`);
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
  }
} else {
  console.error('❌ Cannot initialize Firebase: No valid service account');
}

// =============================================
// API CONFIGURATION
// =============================================
// Get API key from environment
const API_KEY = process.env.API_KEY || 'cte-password-reset-2024-secret-key';
console.log(`🔑 API Key configured: ${API_KEY.substring(0, 5)}...`);

// =============================================
// ROOT ENDPOINT
// =============================================
app.get('/', (req, res) => {
  console.log('✓ Root endpoint hit');
  res.json({ 
    status: 'running',
    firebase: firebaseInitialized,
    message: 'Password Reset API is operational',
    timestamp: new Date().toISOString()
  });
});

// =============================================
// TEST ENDPOINT
// =============================================
app.get('/test', (req, res) => {
  console.log('✓ Test endpoint hit');
  res.json({ 
    success: true, 
    message: 'Test endpoint is working',
    firebase: firebaseInitialized ? 'ready' : 'not ready',
    timestamp: new Date().toISOString()
  });
});

// =============================================
// DEBUG ENDPOINT
// =============================================
app.get('/debug', (req, res) => {
  console.log('✓ Debug endpoint hit');
  res.json({
    environment: {
      hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      hasApiKey: !!process.env.API_KEY,
      nodeEnv: process.env.NODE_ENV || 'not set',
      port: process.env.PORT || 3000
    },
    firebase: {
      initialized: firebaseInitialized,
      projectId: serviceAccount?.project_id || 'unknown',
      clientEmail: serviceAccount?.client_email || 'unknown'
    },
    server: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// =============================================
// GENERATE RESET LINK ENDPOINT
// =============================================
app.post('/generate-reset-link', async (req, res) => {
  console.log('✓ Generate reset link endpoint hit');
  console.log('Request body:', req.body);
  
  const { apiKey, email } = req.body;
  
  // Check if Firebase is initialized
  if (!firebaseInitialized) {
    return res.status(503).json({ 
      error: 'Firebase not initialized - check server logs',
      details: 'Service account may be invalid or missing'
    });
  }
  
  // Verify API key
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ 
      error: 'Unauthorized - Invalid API key',
      received: apiKey ? `${apiKey.substring(0, 5)}...` : 'none'
    });
  }
  
  // Validate email
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  try {
    console.log(`🔐 Generating reset link for: ${email}`);
    
    // Generate Firebase password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    
    console.log(`✅ Link generated successfully for: ${email}`);
    
    res.json({ 
      success: true, 
      resetLink: resetLink,
      email: email,
      expiresIn: '1 hour'
    });
    
  } catch (error) {
    console.error('❌ Error generating link:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      res.status(404).json({ 
        error: 'User not found',
        email: email 
      });
    } else if (error.code === 'auth/too-many-requests') {
      res.status(429).json({ 
        error: 'Too many reset attempts. Please try again later.' 
      });
    } else {
      res.status(500).json({ 
        error: error.message,
        code: error.code || 'unknown'
      });
    }
  }
});

// =============================================
// CATCH-ALL FOR UNDEFINED ROUTES
// =============================================
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: [
      'GET /',
      'GET /test', 
      'GET /debug', 
      'POST /generate-reset-link'
    ]
  });
});

// =============================================
// START SERVER
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/test`);
  console.log(`🔗 Debug: http://localhost:${PORT}/debug`);
  console.log('='.repeat(50));
  
  if (!firebaseInitialized) {
    console.log('⚠️  WARNING: Firebase is NOT initialized');
    console.log('⚠️  Set GOOGLE_APPLICATION_CREDENTIALS_JSON in Railway variables');
  } else {
    console.log('🔥 Firebase is ready to generate reset links');
  }
});
