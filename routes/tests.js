const express = require('express');
const router = express.Router();

const testController = require('../controllers/testController');

//GET home
router.get('/', testController.getHome);

//GET test
router.get('/test', testController.getTests);

//GET test
router.get('/user', testController.getUser);

module.exports = router;