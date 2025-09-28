const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hamad1919ahmad@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password-here' // You'll need to set this
    }
  });
};

// Format date for email display
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time for email display
const formatTime = (timeString) => {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Generate interview email HTML template
const generateInterviewEmailHTML = (interviewDetails) => {
  const { candidateName, candidateEmail, position, department, date, time, type, location, instructions } = interviewDetails;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Interview Invitation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .details-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4299e1; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #2d3748; }
        .value { color: #4a5568; }
        .instructions { background: #ebf8ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 14px; }
        .button { display: inline-block; background: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Interview Invitation</h1>
          <p>You've been selected for an interview!</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${candidateName}</strong>,</p>
          
          <p>Congratulations! We are pleased to invite you for an interview for the <strong>${position}</strong> position in our <strong>${department}</strong> department.</p>
          
          <div class="details-box">
            <h3 style="margin-top: 0; color: #2d3748;">📅 Interview Details</h3>
            
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formatDate(date)}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${formatTime(time)}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Interview Type:</span>
              <span class="value">${type.charAt(0).toUpperCase() + type.slice(1)} Interview</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">${type === 'online' && location.includes('meet.jit.si') ? `<a href="${location}" target="_blank" style="color: #3182ce; text-decoration: none;">Join Online Meeting</a>` : location}</span>
            </div>
          </div>
          
          ${instructions ? `
            <div class="instructions">
              <h4 style="margin-top: 0; color: #2b6cb0;">📝 Special Instructions</h4>
              <p style="margin-bottom: 0;">${instructions}</p>
            </div>
          ` : ''}
          
          ${type === 'online' && location.includes('meet.jit.si') ? `
          <div style="background-color: #e6f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3182ce;">
            <h4 style="margin: 0 0 10px 0; color: #2d3748;">🎥 Online Interview Instructions</h4>
            <p style="margin: 5px 0;">Click the meeting link above at your scheduled time to join the interview.</p>
            <p style="margin: 5px 0;">Please ensure you have a stable internet connection and test your camera/microphone beforehand.</p>
            <p style="margin: 5px 0;"><strong>Meeting Link:</strong> <a href="${location}" target="_blank" style="color: #3182ce;">${location}</a></p>
          </div>
          ` : ''}
          
          <p>Please confirm your attendance by replying to this email. If you need to reschedule, please contact us as soon as possible.</p>
          
          <p>We look forward to meeting you and discussing your qualifications for this position.</p>
          
          <div class="footer">
            <p>Best regards,<br>
            <strong>HR Department</strong><br>
            Company Name<br>
            📧 hamad1919ahmad@gmail.com</p>
            
            <p><em>This is an automated message. Please do not reply directly to this email for scheduling changes.</em></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send interview invitation email
const sendInterviewEmail = async (interviewDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'HR Department',
        address: 'hamad1919ahmad@gmail.com'
      },
      to: interviewDetails.candidateEmail,
      subject: `Interview Invitation - ${interviewDetails.position} Position`,
      html: generateInterviewEmailHTML(interviewDetails),
      // Plain text fallback
      text: `
Dear ${interviewDetails.candidateName},

Congratulations! You have been selected for an interview for the ${interviewDetails.position} position.

Interview Details:
- Date: ${formatDate(interviewDetails.date)}
- Time: ${formatTime(interviewDetails.time)}
- Type: ${interviewDetails.type.charAt(0).toUpperCase() + interviewDetails.type.slice(1)} Interview
- Location: ${interviewDetails.location}

${interviewDetails.type === 'online' && interviewDetails.location.includes('meet.jit.si') ? `
ONLINE INTERVIEW INSTRUCTIONS:
- Click this link at your scheduled time: ${interviewDetails.location}
- Ensure you have a stable internet connection
- Test your camera and microphone beforehand
` : ''}

${interviewDetails.instructions ? `Special Instructions: ${interviewDetails.instructions}` : ''}

Please confirm your attendance by replying to this email.

Best regards,
HR Department
hamad1919ahmad@gmail.com
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('Interview email sent successfully:', {
      messageId: result.messageId,
      to: interviewDetails.candidateEmail,
      subject: mailOptions.subject
    });
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Interview invitation sent successfully'
    };
    
  } catch (error) {
    console.error('Error sending interview email:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to send interview invitation'
    };
  }
};

// Test email connection
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error('Email service configuration error:', error);
    return false;
  }
};

module.exports = {
  sendInterviewEmail,
  testEmailConnection,
  formatDate,
  formatTime
};
