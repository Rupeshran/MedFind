const Reminder = require('../models/Reminder');

// Get all reminders for the user
exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reminders.length, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new reminder
exports.createReminder = async (req, res) => {
  try {
    const { medicineName, dosage, frequency, times, startDate, endDate, notes } = req.body;

    const reminder = await Reminder.create({
      user: req.user._id,
      medicineName,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      notes,
    });

    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Invalid data' });
  }
};

// Update/Toggle a reminder
exports.updateReminder = async (req, res) => {
  try {
    let reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: reminder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Invalid data' });
  }
};

// Delete a reminder
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    await reminder.deleteOne();
    res.status(200).json({ success: true, message: 'Reminder removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
