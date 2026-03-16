const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 🔴 IMPORTANT: PASTE YOUR SERVICE ACCOUNT KEY HERE
// Delete the placeholder below and paste your actual JSON key
const serviceAccount = {
  "type": "service_account",
  "project_id": "icgc-cte-cm-attendance",
  "private_key_id": "41daa63c004f7743476978443ea8b8948ac60f8c",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQCrvpYox1ROIWuY\nuBlLdk0G2aGzJUFtL7Jk3EzIM/HXoAjuLrVbFixVAJtcxRFUrkMrJwsJaBZpia5y\nmEr0kypGtcELAp7wjarLpsF8KAnQ/G3Wfe9DNp6wDJ8c7D1Khrri3KQr70z/y08s\ndHMr5dFxcRDRsvHfV3L2bF9D8EVYu4IAiJL07pM5egO2361kiGu+4ljc6RAeEWa0\na09XYyVxxX0tJXpbDe3xszQ6PvKOScb5gHSk+GbwGlnJwD+jCPwfCW0psn6buSEL\nyeOtkIWpOra4aiEK/pAAhbcivW8so/aw+4IUQj2kb5AC0f0QkpxET3KgJyqlJ1aH\nu6IjluGFAgMBAAECggEAB6fE5zftWtc0Bdhs7jdtewjv432dYznNTKAiPwlLtiYQ\nx9cmp9L+8mIGytWQ7nKfFVkV7ZspZpZnw31k1+6IY6L94hkBjyztaEr8VGWvfFSI\nK9esttUEMUo6vG4OVFhZk7usiLXPu5YrJwrgyFvj4FffHU3J6L/r5K6Td4KKAMi2\nLGlSCXiJcy5BXvO3yBzV7qCzIGPeR98ESI6sEh5yk/J+c1GossxnPNjqFcdvUjVp\nBPoNd2kno4fw9EkcabSjkpgTzgQTayWHN0lDOFDpzxSR3WiaJudVZf+OXV4ukwFw\nS7tBSotH8EhQSWwdjH0wK6m2dIvQUWyNDIbdbBMDUQKBgQDdDiyVp4ZxmOQcIqtW\nH5kxciYDrXqiIWEthyl+g60hNg5ipOfHxk9BCrTEdRjV/I6CqHOrFb/lCDRtrJjW\nkGpou7YD6slA7xeKoM9nAqyDSJUsH17IpWUyuAIykUZ2XVDsxzsXS8xEz2hHXJGM\nYEK+uYAiy0kav/AmcBrsO/TiUQKBgQDG5N1A87UJcXbmT91Bnd9XFzOq57QglePN\n3OEDWB+6t8Eli+8WrzOII9H9hcm3CHR18vgF656vG8rNDL0jHP/eXDFDxi8oDZpC\nomiewAriw6O6UPft2w0q89HaPKGWwNHiT0VVZWgPyV97JksL4P5fvDOexE2Q5K3p\neYASTEkq9QKBgFqaDaIE+LCklpIFj64L43EFtRj6yHGdNsQ/Sr2E4Lfk/P5nUmxq\nFl+1MKP4zoYeLpbUzhvIHU+VDlAJVtdSd5qXnSF74KLRnBeAk6FH0kc4v5NHBEU+\nrPyduKDbNEMdOibh/ZEtyvpE/BuLkEg1yAV96EvagAsLsjU+63n5lQQRAoGAJFIn\nFXVr2g2eaPCstw7dekoCZXNqsYit0SpE7Rdqs+5al0C2qK3V+0aPUnzcGVCx89gq\n8unUUKYCou9wmrjxAOpVFMtcUTQqt4BxGox3cHHJtHyUyhr2jKF58SChYaZUrb9M\nKgwatMdRaGvVyJWN3m2//35Zq9wW5kwJ102XDwECfySg3XUNFp/XvDRBGp1mhZFc\n3a/yqGSwwHhJGaqHHdWUTyFYaL5dKsS2TWoW0xlC2TZ7Isj43/501eGr/8Cs9oPl\nYMnV7evSAusI8erxfvSe2ZaWOBAKsrFNydWWLXfrrkT1EJ5xTbQmF9ya7VTtGvPv\nQeVKQi+RXC3yp3sVPSY=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@icgc-cte-cm-attendance.iam.gserviceaccount.com",
  "client_id": "111300832016883932097",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40icgc-cte-cm-attendance.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Initialize Firebase Admin with your service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Security: Change this to a random string
const API_KEY = 'cte-password-reset-2024-secret-key';

// Endpoint to generate password reset links
app.post('/generate-reset-link', async (req, res) => {
  const { apiKey, email } = req.body;
  
  // Verify API key
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
  }
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    console.log(`Generating reset link for: ${email}`);
    
    // Generate Firebase password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    
    console.log(`✅ Link generated successfully for: ${email}`);
    
    res.json({ 
      success: true, 
      resetLink: resetLink,
      email: email
    });
  } catch (error) {
    console.error('Error generating link:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    message: 'Password Reset API is operational',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!',
    endpoints: {
      generateLink: 'POST /generate-reset-link'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Test the API at: https://localhost:${PORT}/test`);
});
