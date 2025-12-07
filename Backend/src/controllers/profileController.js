const Profile = require('../models/Profile');

// Get all profiles
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create profile
exports.createProfile = async (req, res) => {
  try {
    const { name, timezone } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const profile = new Profile({
      name,
      timezone: timezone || 'UTC'
    });

    const newProfile = await profile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update profile timezone
exports.updateProfileTimezone = async (req, res) => {
  try {
    const { timezone } = req.body;
    
    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      { timezone },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
