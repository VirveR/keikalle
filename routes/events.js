const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');

//GET home
router.get('/', eventController.getHome);

//GET assorted events
router.post('/', eventController.searchEvents);

//GET event page
router.get('/event', eventController.getEvent);

module.exports = router;