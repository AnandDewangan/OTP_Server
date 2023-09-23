const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

// Initialize Twilio client (replace with your Twilio credentials)
const twilioClient = twilio('AC896d63b7d76de546c7d27e3e7e27216d', 'ebb37562264de91b8665d8486c78addb');

// Store generated OTPs (in-memory, replace with a database in production)
const otps = {};

// Generate a random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Endpoint to generate OTP and send it via SMS
app.post('/generateOTP', (req, res) => {
  const { countryCode, mobileNumber } = req.body;
  const otp = generateOTP();

  // In a real application, you would send the OTP via SMS using Twilio
  twilioClient.messages
    .create({
      body: `Your OTP is: ${otp}`,
      from: '+15076525306',
      to: `${countryCode}${mobileNumber}`,
    })
    .then(() => {
      // Store the OTP (in-memory, replace with a database in production)
      otps[mobileNumber] = otp;
      res.json({ success: true, message: 'OTP sent successfully' });
    })
    .catch((error) => {
      console.error('Error sending OTP:', error);
      res.status(500).json({ success: false, message: 'Failed to send OTP' });
    });
});

// Endpoint to verify OTP
app.post('/verifyOTP', (req, res) => {
  const { mobileNumber, enteredOTP } = req.body;
  const storedOTP = otps[mobileNumber];

  if (enteredOTP === storedOTP) {
    res.json({ success: true, message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
