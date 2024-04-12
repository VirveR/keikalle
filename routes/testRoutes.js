const express = require('express');
const router = express.Router();

const testController = require('../controllers/testController');

//GET home
router.get('/', testController.getHome);

module.exports = router;