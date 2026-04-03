const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const { sendMedicationReminderEmail } = require('./emailService');

const initReminderScheduler = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Format current time as HH:mm to match the database
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      console.log(`[Scheduler] Checking reminders for ${currentTime}...`);

      // Find active reminders that have this specific time in their 'times' array
      const activeReminders = await Reminder.find({
        isActive: true,
        times: currentTime
      }).populate('user', 'name email');

      if (activeReminders.length > 0) {
        console.log(`[Scheduler] Found ${activeReminders.length} reminders to trigger.`);
        
        for (const reminder of activeReminders) {
          if (reminder.user && reminder.user.email) {
            await sendMedicationReminderEmail(
              reminder.user.email,
              reminder.user.name,
              reminder.medicineName,
              reminder.dosage,
              currentTime
            );
          }
        }
      }
    } catch (error) {
      console.error('[Scheduler] Error in reminder cron job:', error);
    }
  });

  console.log('✅ Medicine Intake Reminder Scheduler Initialized (Running every minute)');
};

module.exports = initReminderScheduler;
