// Registration verification email HTML template
const generateRegistrationVerificationEmailHTML = (code, expiresInMinutes) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 40px 30px; }
                .code-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
                .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace; }
                .info-box { background: #e7f3ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2196F3; }
                .warning { background: #fff3cd; border-left-color: #ffc107; }
                .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #666; font-size: 14px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✉️ Verify Your Email</h1>
                    <p>Welcome! Please verify your email to complete registration</p>
                </div>
                
                <div class="content">
                    <p>Thank you for registering! To complete your account setup, please enter the verification code below:</p>
                    
                    <div class="code-box">
                        <div style="color: #666; font-size: 14px; margin-bottom: 10px;">Your Verification Code</div>
                        <div class="code">${code}</div>
                    </div>
                    
                    <div class="info-box">
                        <p style="margin: 0;"><strong>⏰ Important:</strong> This code will expire in <strong>${expiresInMinutes} minutes</strong>.</p>
                    </div>
                    
                    <div class="info-box warning">
                        <p style="margin: 0;"><strong>🔒 Security Note:</strong> Never share this code with anyone. Our team will never ask you for this code.</p>
                    </div>
                    
                    <p>If you didn't request this registration, please ignore this email.</p>
                </div>
                
                <div class="footer">
                    <p><strong>HR Management System</strong></p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

// Registration verification email plain text template
const generateRegistrationVerificationEmailText = (code, expiresInMinutes) => {
    return `
VERIFY YOUR EMAIL
================

Thank you for registering!

To complete your account setup, please enter the verification code below:

VERIFICATION CODE: ${code}

⏰ IMPORTANT: This code will expire in ${expiresInMinutes} minutes.

🔒 SECURITY NOTE: Never share this code with anyone. Our team will never ask you for this code.

If you didn't request this registration, please ignore this email.

---
HR Management System
This is an automated message, please do not reply to this email.
    `.trim();
};

module.exports = {
    generateRegistrationVerificationEmailHTML,
    generateRegistrationVerificationEmailText
};
