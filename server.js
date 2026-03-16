const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();

// Allow your app to call this API
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin with your service account
// Download this from: Firebase Console → Project Settings → Service Accounts
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Simple API key for security (you can generate a random string)
const API_KEY = 'your-secret-key-here-change-this';

// Endpoint to generate password reset link
app.post('/generate-reset-link', async (req, res) => {
  const { apiKey, email } = req.body;
  
  // Simple authentication
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Generate Firebase password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    
    // Return the link
    res.json({ 
      success: true, 
      resetLink: resetLink,
      email: email
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Simple web interface for testing
app.get('/', (req, res) => {
  res.send(`
    <h2>Password Reset Link Generator</h2>
    <form id="resetForm">
      <input type="email" id="email" placeholder="user@ctechildrenministry.com" required>
      <button type="submit">Generate Reset Link</button>
    </form>
    <div id="result"></div>
    
    <script>
      document.getElementById('resetForm').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const result = document.getElementById('result');
        
        result.innerHTML = 'Generating...';
        
        try {
          const response = await fetch('/generate-reset-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: 'your-secret-key-here-change-this',
              email: email
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            result.innerHTML = \`
              <div style="background: #d4edda; padding: 15px; border-radius: 5px;">
                <p><strong>Reset Link Generated!</strong></p>
                <p>Email: \${data.email}</p>
                <p>Link: <a href="\${data.resetLink}" target="_blank">\${data.resetLink}</a></p>
                <p>Copy this link and send to the user via WhatsApp/SMS</p>
              </div>
            \`;
          } else {
            result.innerHTML = \`<div style="background: #f8d7da; padding: 15px;">Error: \${data.error}</div>\`;
          }
        } catch (error) {
          result.innerHTML = \`<div style="background: #f8d7da; padding: 15px;">Error: \${error.message}</div>\`;
        }
      };
    </script>
  `);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});