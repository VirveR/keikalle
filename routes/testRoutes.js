const express = require('express');
const router = express.Router();

const testController = require('../controllers/testController');

//GET home
router.get('/', testController.getHome);

//GET user by id --> go to profile
router.get('/profile', testController.getUserById);

module.exports = router;