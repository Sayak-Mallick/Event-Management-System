const Event = require('../models/Event');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// Get all events for a profile
exports.getEventsForProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const events = await Event.find({ profiles: profileId })
      .populate('profiles', 'name timezone')
      .populate('createdBy', 'name')
      .populate('updateLogs.updatedBy', 'name')
      .sort({ startDateTime: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('profiles', 'name timezone')
      .populate('createdBy', 'name')
      .populate('updateLogs.updatedBy', 'name')
      .sort({ startDateTime: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single event
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('profiles', 'name timezone')
      .populate('createdBy', 'name')
      .populate('updateLogs.updatedBy', 'name');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, profiles, timezone, startDateTime, endDateTime, createdBy } = req.body;

    // Validation
    if (!title || !profiles || !timezone || !startDateTime || !endDateTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Convert dates to UTC for storage
    const start = dayjs.tz(startDateTime, timezone).utc().toDate();
    const end = dayjs.tz(endDateTime, timezone).utc().toDate();

    // Validate end is after start
    if (end <= start) {
      return res.status(400).json({ message: 'End date/time must be after start date/time' });
    }

    // Validate end is not in the past
    if (dayjs(end).isBefore(dayjs())) {
      return res.status(400).json({ message: 'End date/time cannot be in the past' });
    }

    const event = new Event({
      title,
      description,
      profiles,
      timezone,
      startDateTime: start,
      endDateTime: end,
      createdBy
    });

    const newEvent = await event.save();
    const populatedEvent = await Event.findById(newEvent._id)
      .populate('profiles', 'name timezone')
      .populate('createdBy', 'name');

    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, profiles, timezone, startDateTime, endDateTime, updatedBy, userTimezone } = req.body;

    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Track changes for update log
    const changes = [];

    if (title && title !== existingEvent.title) {
      changes.push({ field: 'title', oldValue: existingEvent.title, newValue: title });
      existingEvent.title = title;
    }

    if (description !== undefined && description !== existingEvent.description) {
      changes.push({ field: 'description', oldValue: existingEvent.description, newValue: description });
      existingEvent.description = description;
    }

    if (profiles && JSON.stringify(profiles) !== JSON.stringify(existingEvent.profiles)) {
      changes.push({ field: 'profiles', oldValue: existingEvent.profiles, newValue: profiles });
      existingEvent.profiles = profiles;
    }

    if (timezone && timezone !== existingEvent.timezone) {
      changes.push({ field: 'timezone', oldValue: existingEvent.timezone, newValue: timezone });
      existingEvent.timezone = timezone;
    }

    if (startDateTime) {
      const newStart = dayjs.tz(startDateTime, timezone || existingEvent.timezone).utc().toDate();
      if (newStart.getTime() !== existingEvent.startDateTime.getTime()) {
        changes.push({ 
          field: 'startDateTime', 
          oldValue: existingEvent.startDateTime, 
          newValue: newStart 
        });
        existingEvent.startDateTime = newStart;
      }
    }

    if (endDateTime) {
      const newEnd = dayjs.tz(endDateTime, timezone || existingEvent.timezone).utc().toDate();
      if (newEnd.getTime() !== existingEvent.endDateTime.getTime()) {
        changes.push({ 
          field: 'endDateTime', 
          oldValue: existingEvent.endDateTime, 
          newValue: newEnd 
        });
        existingEvent.endDateTime = newEnd;
      }
    }

    // Validate end is after start
    if (existingEvent.endDateTime <= existingEvent.startDateTime) {
      return res.status(400).json({ message: 'End date/time must be after start date/time' });
    }

    // Add update log if there were changes
    if (changes.length > 0) {
      existingEvent.updateLogs.push({
        updatedBy,
        timezone: userTimezone || 'UTC',
        changes
      });
      existingEvent.updatedAt = Date.now();
    }

    await existingEvent.save();

    const updatedEvent = await Event.findById(id)
      .populate('profiles', 'name timezone')
      .populate('createdBy', 'name')
      .populate('updateLogs.updatedBy', 'name');

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
