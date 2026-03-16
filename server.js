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
  "private_key_id": "2d7919a71861458a52998337fbb4201c1b50dd57",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCetYvvKJ0OpAut\nbwYsZ+NwfymvNEYtPWNT9biHg3TA2Sig6PM/jE6V9pEdd9HdhPIgyF7pCZBAidIS\nJBK1q87OCKuxn1NfrJFTF8hH7i78Us0bWF/4B2tRSTrVBBLI1S0F5kvXT3DA4WpI\nLg+gEdI3dCQMTXoG0lfdl3x9wE8Kl6YW+p9laqhVonNcvGKGC0mIyyCI/CFuT9Su\nbRfGQ6cD1pWVNW57O1Q5oG6XVq1AtWF60C9zbfEw+GxhUDTOz5nG3QtNs0PUpjji\nhehtStIisxZ8lRII5fM21MK7nIgyVvFdocK/AEMpvd6Pr8C/xMSnquw2G2la7ueD\nNKfEBZzBAgMBAAECggEAPt8YgjOKlEQ0RA5ZWboGBYi6kKearU1GTfpnkXdoBwV/\n7M6bni8M6qd0sUHIJ4MFECuQPa0GMirmxzz3FHTtRf11VrYRJzOLlmkzdBtNDbQX\ngJ+v1OfLgbYK0lv8vQaGAXJL1Q2pUx95JQLqObUVm9YseZsvnggxupzKOl62cTEm\naKTt0PJq7RNlLxyW+Wye2lXZPBFNQjGYP7CGDywaWA4eq5qd1xvtLF2JJCEVXkqM\nTpiNE9B9Sf7FBQnj4Oi+LfZpkoUiZzu541Z4J4Nj88za1JSbB7Oc3Vp8H5RzFFye\nRNoll3wsjo6iXOMA/1qftN37vMrgBl0YVjQEePBlyQKBgQDMj3Qkp6VeEq57R9PX\n+VZEHPMclxI9mapNuuNqm8c31EE/VZ6ojigS3u2go1g97Z65CIkFAOLPsLuwiHvK\nb3leTNrq9ovrmqfdO9EBLKgFa92oHDWqY5gp0v/xJJUUb0JR4rLaYRzJKrf8c0Zz\nMy9zOTjJT2ZLVsgBzNNdb8qPgwKBgQDGnm2WO9h11JwwEKGQYw9hc0qegBP2Nzlf\nQn5b5e8O7Ovdty9XX0NLDeCuQ7llaTdorTxXleNVJVJ+8zUoiQ+FdpxFckhygtyk\nvzdsO3QqGgrytffLPAGjR3qPbMfibdQ/OgHV6VG8qoaiKPrdoNIltvaoB+lt6f2d\nNGoPQTsLawKBgB+3Kim4uGHygYzpoQW+Scq7tlG7dn+IgKgWjsXrqyKTzR31t2io\nybvLRop+aOMJIW/My/mznnbXDvKa5p6HVAjz34lIen8n9ljNumT1OIPGqpIy9Xsa\nf/AUH8ySgG6vpVeuz04eemkSL357nPOlfvjdaVmE7vZFWTM2P5sgBwbjAoGBAKqF\nljxngP4Y3Ud+39cg1TGrVCMkfv7ihsU8R1QK4uWDjzU5ctGmnhWwAnha+K8SWFns\ncWQY8aZGdr87eyYkFklVffE5nu2BYIGpEaJAoQkMdt3OUMIR8K4ITjcZA7to49Ks\nsKrAuEYseY57dHYW/pUWskmtEUImpHD1cSFLta+lAoGAHY+uyvY0p1ox4VrfMm9M\nMjb1as+UgcyOUFApP+7JBv1LFbH6OSGaWTZOV6YBQhi5DLC+ar2VJisArlCwmYNp\nYHy0XAd6poJ5XlyR17S6fep28OneFqsfLOLw8Ekkbd9LthqOwSiUFBZzuChFZGdz\nd8emSX0DVvswYyChrY2Q7DY=\n-----END PRIVATE KEY-----\n",
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
