const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

const upload = require('../middlewares/upload');

// This is for the sessions. Can be cleaned out in a better place when everything works!!!!!!!
const auth = (req, res, next) => {
    if (!req.session.user) {
        return res.render("index", {
            info: "Kirjaudu sisään, niin pääset käyttämään ohjelman kaikkia toimintoja!"
        });
    }
    else return next();
}

//GET user
router.get('/user', userController.getUser);

//GET user by alias (from url, /user/alias)
router.get('/user/:alias', userController.getUserByAlias);

//GET user by id --> go to profile
router.get('/profile', auth, userController.getUserProfile);

//GET boolean whether the alias is in the database. returns json({found: true/false})
router.get('/user/get_if_alias/:alias', userController.getBooleanIfAliasInDB);

//POST send login information
router.post('/user/login', userController.userLogin);

//Add new user to the db
router.post('/user', userController.addNewUser);

//UPDATE user information
router.post('/profile', userController.updateUser);

//UPDATE users profile picture
router.post('/profile/upload/profilepic', upload.single('uploadProfilePicture'), userController.uploadProfilePic);

//DELETE user from the db
router.post('/delete-profile', userController.deleteUser);

module.exports = router;

