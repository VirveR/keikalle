const express = require('express');
const router = express.Router();

const testController = require('../controllers/testController');

//GET home
router.get('/', testController.getHome);

//UPDATE profile information
router.post('/profile/:id', testController.updateProfile);

module.exports = router;