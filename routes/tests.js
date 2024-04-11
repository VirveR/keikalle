const express = require('express');
const router = express.Router();

const testController = require('../controllers/testController');

//GET home
router.get('/', testController.getHome);

//GET test
router.get('/test', testController.getTests);

module.exports = router;