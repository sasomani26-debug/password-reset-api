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
  "private_key_id": "fda49ecaf66067d9a548ea26a18472493f2e9a0f",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDwWQQtJ6gnCxCP\nlV1MphkM44Z7WFAfUJxnDYFqAOmQJsATwd5CxBnhnOkGU2Tnt/MLTJwl1tF3SUVP\nwp84ZFNzIyvgx/HGL0p1FLOmJo83Y8i7VIGhulsOMZv4TYdOd+9Mn6g4kBpz+DmV\nbG0w3+fvGSyMPl4MhYvrqbqFrofRLSK4MjfZWzm5wH4D7g2QY1qsay7zUAihvlo+\nzUcEI6DVu4ID8TyPcFzJQ8rJ54albeqTEItR0XNFmN4cMcns37BJm8b7d0/mKMGs\nmrgZcIN8xIJJ7yQc0YRgyMibvcPf4MbMnf32jxnr4D1U0PdQlh0z7Fn15GzM2yNj\n9sSuW3vlAgMBAAECggEALIurCP1xHm9gDeSWira8LNXcnm7DRtKHclgf9Lgfkc6E\nygSj/4bd7yFIVRpOuN2wh5cW17KFVxD27i35mZeKmevaXYphRqSMLb/8/d3mrFLr\nqMCkWAe0iaBrMm2YFtSGvxJWOMmIhZbrgUS7xhOxpnBpf8KtZq+3u6FVByLOXFef\nwd28vDBv6UfOF8T6Dn6djq+6Op/D/EXmMalr8xKDXtmmDwLLCzT1HZGNETeGDD4Z\nwNGG3muk3ur15RSEWal0jcc2yvHdqRexuIsFWB3FHanSP4TPyBoX+3iRBF+1QlrS\nO6RVMgTqFac2VW53uo9aJjDESjwGtBhW5DeKeUoyfwKBgQD8gPNRDUfaECqIzEPj\nzukCkiyVgsg1bVRvtEytyHB9hVZUonAsYx3eAhjtpo785qMZcENH1QNp0LrkhAK8\n3YXbh+3GBmMEZxBTe/Uwb0h6CSfGXs/LhsHz8Es3jWKCjQ/t8+9CND7mkutJlhLD\ngB829BuFMXF++ZeMaOlribP1OwKBgQDzrPn9yDnFp8IVTds18DXbQ0i6aojYSzW7\njPyjomS8f1zdXMPiMh49ryMi98TtL9n7MeLnnkNEJuZd//QXoDXnBkl9m7FHCi3h\nFLyhs4MBt9YwbhvUntS/8YRVEH2uGHcSZTHvZf96KVmyIeOJA3ou0CrQzhhYdPVb\nF4mupvbBXwKBgQCvJHqhU8bs+J2oOZc1osV45Q9LvWVFucoBmVw+hnOQfTY+ilWo\nVC/ZWDcWUJuJzCiBcp8YaiZt9TxNWUvU2QsKFSTWYIO6AAsQ/UA7ElWBYGxYaldT\n4usRWzGxHL6hs1rDQJpKn5aptGrDpfbp6Cq+oV+daYhB/LojyHlwABn1FQKBgQDp\nsjprhwzJIHPFxM54s3CjYasthaDKd48H2VYuhT9BfJCOiDohBFn2ZLI5BhEqPNs8\nywJHioQOp5QGEMSDqBYqA+CVg60IaZ3IoP+rwSLikfHsrp0oVE/L6hA1GMTAJByG\nWuECLPtQqLmqWlADBn+2x9RYP2Af7cOl4jQceWpr1wKBgQDxO+VAV1o45hoIvvr6\nfghCo4d0Yf7vE6BZyf8X3B6zkSi+wYu/Yn6lxmWzIKxRaAMRqD6TjY0KN9vFqQXl\nAoqXJDdguTQoqACKZM2afRc1qGZR2rqQK0VUALv0FNMizrm+x5/XKGsZMRMPPBpv\nwbt8Oj7TeJiQU0Ix5CiTgjg7zw==\n-----END PRIVATE KEY-----\n",
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
