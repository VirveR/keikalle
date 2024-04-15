const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

//GET user
router.get('/user', userController.getUser);

//GET user by alias (from url, /user/alias)
router.get('/user/:alias', userController.getUserByAlias);

router.post('/user/login', userController.userLogin);

module.exports = router;