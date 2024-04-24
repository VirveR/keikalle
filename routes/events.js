const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');

// Function to validate and sanitate form data
const { sanitizeEventSearch } = require('../middlewares/formValidateSanitize');

//GET home
router.get('/', eventController.getHome);

//GET assorted events
router.post('/', sanitizeEventSearch, eventController.searchEvents);

//GET event page
router.get('/event', eventController.getEvent);

//POST register user to event
router.post('/registerToEvent', eventController.registerToEvent);

module.exports = router;