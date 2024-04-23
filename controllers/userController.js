//Database connection
const mongoose = require('mongoose');
require('dotenv').config();
const conString = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DB}?retryWrites=true&w=majority&appName=Keikalle`
// For crypting passwords
const bcrypt = require('bcryptjs');

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
sharp.cache(false);

mongoose.connect(conString)
.then(() => {
    console.log('userController connected to database');
})
.catch((error) => {
    console.log(error);
});

const UserModel = require('../models/User');

const upload = require('../middlewares/upload');
const { setTimeout } = require('timers/promises');


//GET all users
const getUser = async (req, res) => {
    try {
        const users = await UserModel.find();
        res.render('user', {
            info: 'Käyttäjän hakeminen onnistui',
            users: users.map(user => user.toJSON())
        });
    }
    catch(error) {
        res.status(404).render('user', {
            info: 'Test failed'
        });
        console.log(error);
    }
};

//GET user by alias
const getUserByAlias = async (req, res) => {
    try {
        const searchedAlias = req.params.alias;
        const users = await UserModel.find({alias: searchedAlias});
        res.render('user', {
            info: 'Käyttäjän hakeminen onnistui',
            users: users.map(user => user.toJSON())
        });
    }
    catch(error) {
        res.status(404).render('user', {
            info: 'Test failed'
        });
        console.log(error);
    }
};

//GET user profile
const getUserProfile = async (req, res) => {
    try {
        const alias = req.session.user.alias;
        const user = await UserModel.findOne({ alias: alias });
        res.render('profile', {
            info: 'Käyttäjän hakeminen onnistui',
            profile: user.toJSON(),
            helpers: { isEqual(a, b) { return a === b; } }
        });
    }
    catch(error) {
        res.status(404).render('profile', {
            info: 'Test failed'
        });
    }
};

//POST login form
const userLogin = async (req, res) => {
    try {
        const alias = req.body.alias;
        const password = req.body.password
        const user = await UserModel.findOne({ alias: alias});
        if (user) {
            // Check password
            if(bcrypt.compareSync(password, user.password)){
                req.session.user = { 
                    alias: req.body.alias,
                    isLoggedIn: true
                };
                await req.session.save();
                req.flash('info', 'Olet kirjautunut sisään');
                res.redirect('/');
            }
            else {
                req.flash('info', 'Tarkista käyttäjätunnus ja salasana.');
                res.redirect('/');
            }
        }
        else {
            req.flash('info', 'Tarkista käyttäjätunnus ja salasana.');
            res.redirect('/');
        }
    }
    catch(error) {
        res.status(404).render('index', {
            info: 'Sisäänkirjautuminen ei onnistunut.'
        });
        console.log(error);
    }
}

// POST new user to DB (data from a form)
const addNewUser = async (req, res) => {
    try {
        // Check if alias is reseved
        const alias = req.body.alias;
        // using RegExp("i") fo case insensitive matches
        const userFromDb = await UserModel.findOne({alias: { $regex : new RegExp("^" + alias + "$", "i") }});

        const password1 = req.body.password;
        const password2 = req.body.password2;

        if (password1 === password2 && !userFromDb) {
            // hash the password
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password1, salt);
            req.body.password = hash;
            // create a document
            const newUser = new UserModel(req.body);
            // save the data to db
            await newUser.save();
            res.render('user', {
                info2: 'Adding was a success'
            });
        }
        else {
            res.render('user', {
                info2: 'Passwords dont match'
            });
        }
        
    }
    catch(error) {
        res.status(500).render('user', {
            info2: 'Adding failed'
        });
        console.log(error);
    }
}

// GET boolean whether the alias is in the database
const getBooleanIfAliasInDB = async (req, res) => {
    try {
        const alias = req.params.alias;
        // using RegExp("i") fo case insensitive matches
        const userFromDb = await UserModel.findOne({alias: { $regex : new RegExp("^" + alias + "$", "i") }});
        if(userFromDb){
            res.json({found : true, id: userFromDb.id});
        }
        else{
            res.json({found: false});
        }
    }
    catch(error) {
        res.status(400).json({error: error});
    }
}

//UPDATE profile information
const updateUser = async (req, res) => {
    const searchedId = req.body.id;
    try {
        const user = await UserModel.findOneAndUpdate({ _id: searchedId }, 
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                alias: req.body.alias,
                email: req.body.email,
                city: req.body.city,
                gender: req.body.gender,
                birthYear: req.body.birthYear},
            {new: true}
            );
        res.render('profile', { 
            profile: user.toJSON(),
            helpers: { isEqual(a, b) { return a === b; } },
            updateInfo: 'Muutokset tallennettu.'
        });
    }
    catch(error) {
        res.status(500).render('profile', {
            profile: user.toJSON(),
            helpers: { isEqual(a, b) { return a === b; } },
            updateInfo: 'Muutoksia ei voitu tallentaa.'
        });
        console.log(error);
    }
}

//UPDATE profile picture
const uploadProfilePic = async (req, res) => {

    // function if file wasn't in image format (jpg, jpeg, png, gif)
    if (req.fileValidationError) {
        res.redirect('/profile');
        console.log(req.fileValidationError);
        return;
    }
    
    // get user id from request
    const userId = req.body.userIdForPictureUpload;

    // renaming file
    var filename = userId  + '.jpg'; //+ path.extname(req.file.originalname);    
    var target_path = './public/images/profileimages/' + filename;
    
    async function resizeImage() {
        try {
            // resize original (req.file.path) image, keep the aspect ratio and save new file
            await sharp(req.file.path).resize(500, 500, {fit: 'inside'}).jpeg({ quality: 90 }).toFile(target_path);

            // update filename to database
            UserModel.findById(userId).then((user) => {
                user.imageSrc = filename;
                user.save();
            })
            res.redirect('/profile');
        } catch (error) {
            console.log(error);
        }
    }
    await resizeImage();
    try{
        fs.unlinkSync(req.file.path);
    }
    catch(error){
        console.log(error);
    }
    
}

//DELETE profile picture
const deleteProfilePicture = async (req, res) => {
    try {
        const userId = req.body.id;
        const imgSrc = './public/images/profileimages/' + req.body.imgSrc;
        if(fs.existsSync(imgSrc)){
            fs.unlinkSync(imgSrc);
        }
        UserModel.findById(userId).then((user) => {
            user.imageSrc = 'kale.png';
            user.save();
        });
        res.redirect('/profile');
    }
    catch(error){
        res.status(404).render('profile', {
            info: 'Test failed'
        });
        console.log(error);
    }
}

//DELETE user
const deleteUser = async (req, res) => {
    try {
        console.log(req.body.id);
        const deleteId = req.body.id;
        const user = await UserModel.findOneAndDelete({ _id: deleteId });
        res.render('index', { info: 'Käyttäjäprofiilisi on nyt poistettu.'});
    }
    catch(error) {
        res.status(404).render('profile', {
            updateInfo: 'Jotain meni pieleen!'
        });
        console.log(error);
    }
}

// End session and remove the session from db
const userLogOut = async (req, res) => {
    try {
        req.flash('info', 'Olet kirjautunut ulos.');
        await req.session.destroy();
        res.redirect('/');
    }
    catch(error) {
        res.status(500).render('index', {
            info: 'Jotain meni pieleen.'
        });
    console.log(error);
    }
};

module.exports = {getUser, getUserByAlias, getUserProfile, userLogin, addNewUser, getBooleanIfAliasInDB, updateUser, uploadProfilePic, deleteProfilePicture, deleteUser, userLogOut};