const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

const upload = require('../middlewares/upload');

// Function to check if the user has signed in
const { auth } = require('../middlewares/validate');
// Function to validate and sanitate form data
const { validateForm, validateLogin, sanitizeProfileUpdate } = require('../middlewares/formValidateSanitize');


//GET user
router.get('/user', userController.getUser);

//GET user by alias (from url, /user/alias)
router.get('/user/:alias', userController.getUserByAlias);

//GET user by id --> go to profile
router.get('/profile', auth, userController.getUserProfile);

//GET boolean whether the alias is in the database. returns json({found: true/false})
router.get('/user/get_if_alias/:alias', userController.getBooleanIfAliasInDB);

//POST send login information and start session if login is successful
router.post('/user/login', validateLogin, userController.userLogin);

//POST new user to the db
router.post('/user', validateForm, userController.addNewUser);

//UPDATE user information
router.post('/profile', sanitizeProfileUpdate, userController.updateUser);

//UPDATE users profile picture
router.post('/profile/upload/profilepic', upload.single('uploadProfilePicture'), userController.uploadProfilePic);

//DELETE profilepicture
router.post('/profile/delete/profilepic', auth, userController.deleteProfilePicture);

//DELETE user from the db
router.post('/delete-profile', userController.deleteUser);

//DESTROY the session when logging out
router.get('/logout', auth, userController.userLogOut);

//GET assorted users via event page
router.post('/:event_id', userController.searchFriends);


module.exports = router;

