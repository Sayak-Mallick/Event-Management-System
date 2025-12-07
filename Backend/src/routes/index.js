const express = require('express');
const profileController = require('../controllers/profileController');
const eventController = require('../controllers/eventController');

const router = express.Router();

// Profile routes
router.get('/profiles', profileController.getAllProfiles);
router.get('/profiles/:id', profileController.getProfile);
router.post('/profiles', profileController.createProfile);
router.patch('/profiles/:id/timezone', profileController.updateProfileTimezone);

// Event routes
router.get('/events', eventController.getAllEvents);
router.get('/events/profile/:profileId', eventController.getEventsForProfile);
router.get('/events/:id', eventController.getEvent);
router.post('/events', eventController.createEvent);
router.put('/events/:id', eventController.updateEvent);
router.delete('/events/:id', eventController.deleteEvent);

module.exports = router;
