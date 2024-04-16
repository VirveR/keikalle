const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

//GET user
router.get('/user', userController.getUser);

//GET user by alias (from url, /user/alias)
router.get('/user/:alias', userController.getUserByAlias);

//GET user by id --> go to profile
router.get('/profile/:id', userController.getUserById);

router.post('/user/login', userController.userLogin);

//Add new user to the db
router.post('/user', userController.addNewUser);

module.exports = router;