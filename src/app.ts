import express from 'express';
import * as admin from 'firebase-admin';
import serviceAccount from './firebase-admin-key.json'; // Import the service account credentials

// Initialize Firebase Admin SDK with service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

// Create an Express application
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

interface FCMError extends Error {
  code?: string;
}

function isFCMError(error: any): error is FCMError {
  return (
    error && typeof error.message === 'string' && typeof error.code === 'string'
  );
}

// Route to send a notification
app.post('/send-notification', async (req, res) => {
  const { deviceToken, title, message } = req.body;

  const notification = {
    notification: {
      title,
      body: message,
    },
    token: deviceToken,
  };

  try {
    const response = await admin.messaging().send(notification);
    console.log('Notification sent:', response);
    res.json({ success: true });
  } catch (error) {
    if (isFCMError(error)) {
      // 'error' is now narrowed down to the 'FCMError' type
      console.error('Error sending notification (FCMError):', error);
      res.status(500).json({ success: false, error: error.message });
    } else {
      // Handle other types of errors here
      console.error('Error sending notification (Unknown Error):', error);
      res.status(500).json({ success: false, error: 'Unknown Error' });
    }
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
