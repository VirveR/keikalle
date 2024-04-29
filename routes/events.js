const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');

// Function to validate and sanitate form data
const { sanitizeEventSearch } = require('../middlewares/formValidateSanitize');

// GET / (Get Home Page with Events)
router.get('/', eventController.getHome);

// POST / (Home Page with Event Search results)
router.post('/', sanitizeEventSearch, eventController.searchEvents);

// POST /registerToEvent (Register user to event)
router.post('/registerToEvent', eventController.registerToEvent);

// POST /unRegisterFromEvent (Remove user from event)
router.post('/unRegisterFromEvent', eventController.unRegisterFromEvent);

// GET /event/:id (Get Event Page by event ID from db)
router.get('/event/:id', eventController.getEvent);

// POST /event/:id (Event Page with Friend Search results)
router.post('/event/:id', eventController.searchFriends);

// GET /accessibility (Get Accessibility report)
router.get('/accessibility', eventController.getAccessibility);

module.exports = router;