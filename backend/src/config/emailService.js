const transporter = require("../config/email_transporter");

const sendVerificationKey = async (email, key, onSendCallback) => {
  const emailHtml = generateEmailHtml(key);
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: "Verification Key - DEBO Microfinance",
    html: emailHtml,
  };
  await sendEmail(mailOptions, onSendCallback);
};

const sendEmail = async (mailOptions, onSendCallback) => {
  try {
    const res = await transporter.sendMail(mailOptions);
    onSendCallback(res);
  } catch (error) {
    throw error;
  }
};

const generateEmailHtml = (key) => {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            padding: 20px;
            margin: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #4CAF50;
            text-align: center;
          }
          p {
            font-size: 16px;
            line-height: 1.5;
          }
          .key-box {
            font-size: 20px;
            font-weight: bold;
            color: #ffffff;
            background-color: #4CAF50;
            padding: 15px;
            text-align: center;
            border-radius: 5px;
            margin-top: 20px;
          }
          .footer {
            font-size: 12px;
            color: #777;
            text-align: center;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Verification Key</h1>
          <p>Hello,</p>
          <p>Please use the verification key below to confirm your email address.</p>
          <div class="key-box">${key}</div>
          <p>If you didn't request this, please ignore this email.</p>
          <div class="footer">
            <p>© ${new Date().getFullYear()} DEBO Microfinance. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>`;
};

module.exports = { sendVerificationKey };
