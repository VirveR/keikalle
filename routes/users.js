const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

const upload = require('../middlewares/upload');

// Function to check if the user has signed in
const { auth } = require('../middlewares/validate');
// Function to validate and sanitate form data
const { validateForm, validateLogin, sanitizeProfileUpdate } = require('../middlewares/formValidateSanitize');


// GET /user (Get all users from db)
router.get('/user', userController.getUser);

// POST /user (Add new user to db)
router.post('/user', validateForm, userController.addNewUser);

// GET /user/:alias (Get user by alias from url)
router.get('/user/:alias', userController.getUserByAlias);

// GET /user/get_if_alias/:alias (returns json({found: true/false})
router.get('/user/get_if_alias/:alias', userController.getBooleanIfAliasInDB);

// POST /user/login (User login, create session)
router.post('/user/login', validateLogin, userController.userLogin);

// GET /profile (Show User Profile Page)
router.get('/profile', auth, userController.getUserProfile);

// GET send email to other user
router.post('/sendEmail', userController.sendEmail);

// POST /profile (Edit user information on Profile Page)
router.post('/profile', sanitizeProfileUpdate, userController.updateUser);

// POST /profile/upload/profilepic (Upload new profile pic on Profile Page)
router.post('/profile/upload/profilepic', upload.single('uploadProfilePicture'), userController.uploadProfilePic);

// POST /profile/upload/profilepic (Delete profile pic on Profile Page)
router.post('/profile/delete/profilepic', auth, userController.deleteProfilePicture);

// POST /delete-profile (Remove user from db)
router.post('/delete-profile', userController.deleteUser);

// GET /logout (Logout user, destroy session)
router.get('/logout', auth, userController.userLogOut);

module.exports = router;

