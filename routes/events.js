const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');

// Function to validate and sanitate form data
const { sanitizeEventSearch } = require('../middlewares/formValidateSanitize');

//GET home
router.get('/', eventController.getHome);

//GET assorted events
router.post('/', sanitizeEventSearch, eventController.searchEvents);

//GET event page by event ID
router.get('/event/:id', eventController.getEvent);

//POST register user to event
router.post('/registerToEvent', eventController.registerToEvent);

//POST remove user from event
router.post('/unRegisterFromEvent', eventController.unRegisterFromEvent);

//POST assorted users via event page
router.post('/event/:id', eventController.searchFriends);

module.exports = router;