// Email template for password reset verification code

const generatePasswordResetEmailHTML = (code, expiresInMinutes = 15) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.95; }
        .content { padding: 40px 30px; }
        .code-container { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0; }
        .verification-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
        .expiry-notice { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .expiry-notice strong { color: #856404; }
        .warning-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .warning-box strong { color: #721c24; }
        .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #6c757d; font-size: 14px; }
        .footer a { color: #667eea; text-decoration: none; }
        p { margin: 15px 0; }
        .icon { font-size: 48px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">🔐</div>
          <h1>Password Reset Request</h1>
          <p>We received a request to reset your password</p>
        </div>
        
        <div class="content">
          <p>Hello,</p>
          
          <p>We received a request to reset the password for your account. To proceed with resetting your password, please use the following verification code:</p>
          
          <div class="code-container">
            <p style="margin: 0 0 10px; font-size: 14px; color: #6c757d;">Your Verification Code</p>
            <div class="verification-code">${code}</div>
          </div>
          
          <div class="expiry-notice">
            <strong>⏰ Important:</strong> This verification code will expire in <strong>${expiresInMinutes} minutes</strong>. Please complete the password reset process before it expires.
          </div>
          
          <div class="warning-box">
            <strong>🛡️ Security Notice:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Never share this code with anyone</li>
              <li>Our team will never ask for this code</li>
              <li>If you didn't request this reset, please ignore this email and ensure your account is secure</li>
            </ul>
          </div>
          
          <p>If you did not request a password reset, please disregard this email. Your password will remain unchanged.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>
          <strong>The Security Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>If you have any concerns, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate plain text version for email clients that don't support HTML
const generatePasswordResetEmailText = (code, expiresInMinutes = 15) => {
    return `
PASSWORD RESET REQUEST

Hello,

We received a request to reset the password for your account.

Your Verification Code: ${code}

IMPORTANT:
- This code will expire in ${expiresInMinutes} minutes
- Never share this code with anyone
- Our team will never ask for this code
- If you didn't request this reset, please ignore this email

If you did not request a password reset, please disregard this email. Your password will remain unchanged.

Best regards,
The Security Team

---
This is an automated message. Please do not reply to this email.
  `;
};

module.exports = {
    generatePasswordResetEmailHTML,
    generatePasswordResetEmailText
};
