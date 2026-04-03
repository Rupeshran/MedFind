const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address (e.g., you@gmail.com)
      pass: process.env.GMAIL_PASS, // Your generated 16-character App Password
    },
  });
};

/**
 * Send a welcome email to a newly registered user
 */
exports.sendWelcomeEmail = async (email, name) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.warn("Email service disabled: GMAIL_USER or GMAIL_PASS missing in .env");
      return;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"MedFind Health Platform" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Welcome to MedFind! Your Healthcare Journey Begins 🌟",
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #10b981; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to MedFind</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff; color: #333333;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
              Thank you for registering on <strong>MedFind</strong>! We are thrilled to have you onboard.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
              With MedFind, you can now:
            </p>
            <ul style="font-size: 16px; line-height: 1.6; color: #4b5563; padding-left: 20px;">
              <li>Search and reserve medicines in real-time.</li>
              <li>Scan prescriptions using AI.</li>
              <li>Check drug interactions safely.</li>
              <li>Talk to MedBot, our intelligent health assistant.</li>
            </ul>
            <br/>
            <a href="http://localhost:5173" style="display: inline-block; background-color: #6366f1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 16px;">Go to Dashboard</a>
            <br/><br/>
            <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              Stay healthy,<br/><strong>The MedFind Team</strong>
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

/**
 * Send a reservation confirmation email
 */
exports.sendReservationEmail = async (email, name, medicineName, pharmacyName) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.warn("Email service disabled: GMAIL_USER or GMAIL_PASS missing in .env");
        return;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"MedFind Reservations" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Medicine Reservation Confirmed! ✅",
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Reservation Confirmed</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff; color: #333333;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
              Your reservation has been successfully placed and the pharmacy has been notified.
            </p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 16px;"><strong>Medicine:</strong> ${medicineName}</p>
              <p style="margin: 10px 0 0 0; font-size: 16px;"><strong>Pickup Location:</strong> ${pharmacyName}</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
              Please show this email or your MedFind dashboard at the pharmacy counter to collect your medicine.
            </p>
            <br/>
            <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              Thank you for using MedFind,<br/><strong>The Healthcare Logistics Team</strong>
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Reservation email sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending reservation email:', error);
  }
};

/**
 * Send a medication intake reminder email
 */
exports.sendMedicationReminderEmail = async (email, name, medicineName, dosage, time) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) return;

    const transporter = createTransporter();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const mailOptions = {
      from: `"MedFind Health Companion" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `💊 Time for Medicine: ${medicineName}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <div style="background: rgba(255,255,255,0.2); width: 60px; height: 60px; borderRadius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 30px;">💊</div>
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Time for your Medicine</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Scheduled Reminder for ${time}</p>
          </div>
          <div style="padding: 40px 30px; background-color: #ffffff; color: #333333;">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">Hi ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
              This is a friendly reminder from your <strong>MedFind Health Companion</strong>. It's time to take your scheduled dose:
            </p>
            
            <div style="background-color: #f0fdf4; border: 1px solid #dcfce7; padding: 25px; margin: 25px 0; border-radius: 12px; text-align: center;">
              <div style="font-size: 14px; color: #15803d; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Medicine</div>
              <div style="font-size: 24px; font-weight: 800; color: #166534; margin-bottom: 5px;">${medicineName}</div>
              <div style="font-size: 16px; color: #166534; opacity: 0.8;">Dosage: ${dosage}</div>
            </div>
            
            <p style="font-size: 15px; line-height: 1.6; color: #6b7280; margin-bottom: 30px;">
              Keeping up with your schedule is key to your recovery. You can view your full daily timeline and manage your reminders in your dashboard.
            </p>
            
            <div style="text-align: center;">
              <a href="${clientUrl}/reminders" style="display: inline-block; background-color: #6366f1; color: white; text-decoration: none; padding: 14px 30px; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);">Open My Schedule</a>
            </div>
            
            <p style="font-size: 13px; line-height: 1.6; color: #9ca3af; margin-top: 40px; border-top: 1px solid #f3f4f6; padding-top: 20px; text-align: center;">
              Stay healthy,<br/><strong>The MedFind Health Team</strong>
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Medication reminder email sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending medication reminder email:', error);
  }
};
