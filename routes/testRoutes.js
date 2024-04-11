const express = require('express');
const router = express.Router();

const testController = require('../controllers/testController');

//GET home
router.get('/', testController.getHome);

//GET user
router.get('/user', testController.getUser);

module.exports = router;