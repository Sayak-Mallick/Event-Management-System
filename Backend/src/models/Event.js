const mongoose = require('mongoose');

const updateLogSchema = new mongoose.Schema({
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  timezone: String,
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }]
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  profiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  }],
  timezone: {
    type: String,
    required: true
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updateLogs: [updateLogSchema]
});

// Validation middleware
eventSchema.pre('save', function(next) {
  if (this.endDateTime <= this.startDateTime) {
    next(new Error('End date/time must be after start date/time'));
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
