const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Load service account
let serviceAccount;
let firebaseInitialized = false;

try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    firebaseInitialized = true;
    console.log('✅ Firebase initialized');
  }
} catch (error) {
  console.error('❌ Firebase error:', error.message);
}

const API_KEY = process.env.API_KEY || 'cte-password-reset-2024-secret-key';

// ========== ROUTES ==========
app.get('/', (req, res) => {
  res.json({ status: 'running', firebase: firebaseInitialized });
});

app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Test endpoint working' });
});

app.get('/debug', (req, res) => {
  res.json({ 
    hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
    firebaseInitialized 
  });
});

app.post('/generate-reset-link', async (req, res) => {
  const { apiKey, email } = req.body;
  
  if (!firebaseInitialized) {
    return res.status(503).json({ error: 'Firebase not ready' });
  }
  
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  try {
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    res.json({ success: true, resetLink, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/test`);
});
