// Database
const mongoose = require('mongoose');
require('dotenv').config();
const conString = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DB}?retryWrites=true&w=majority&appName=Keikalle`

mongoose.connect(conString)
.then(() => {
    console.log('userController connected to database');
})
.catch((error) => {
    console.log(error);
});

const UserModel = require('../models/User');
const EventModel = require('../models/Event'); // Used when sending messages to other users.

//for formatting dates
const { format } = require('date-fns');

// Other necessary stuff
const bcrypt = require('bcryptjs'); // For crypting passwords
const fs = require('fs'); 
const path = require('path');
const sharp = require('sharp');
sharp.cache(false);

const upload = require('../middlewares/upload');
const { setTimeout } = require('timers/promises');
const { sendMail } = require('../middlewares/mailer');


/* ROUTES
    - GET /user (Get all users from db)
    - POST /user (Add new user to db)
    - GET /user/:alias (Get user by alias from url)
    - GET /user/get_if_alias/:alias (returns json({found: true/false})
    - POST /user/login (User login)
    - GET /profile (Show User Profile Page)
    - POST /profile (Edit user information on Profile Page)
    - POST /profile/upload/profilepic (Upload new profile pic on Profile Page)
    - POST /profile/upload/profilepic (Delete profile pic on Profile Page)
    - POST /delete-profile (Remove user from db)
    - GET /logout (Logout user, destroy session)
*/

// GET /user (Get all users from db)
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

// POST /user (Add new user to db)
const addNewUser = async (req, res) => {

    const redirectUrl = req.body.redirect || req.headers.referer || '/';

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
            newUser.imageSrc = "kale.png";
            // save the data to db
            await newUser.save();
            req.flash('info', 'Rekisteröityminen onnistui. Voit nyt kirjautua sisään.');
            res.redirect(redirectUrl);
            
        }
        /* TARVIIKO TÄTÄ, KUN ON VALIDOINNIT?? 
        else {
            req.flash('info', '')
            res.render('user', {
                info2: 'Passwords dont match'
            });
        }*/
        
    }
    catch(error) {
        req.flash('info', 'Jokin meni pieleen rekisteröitymisessä. Kokeile uudestaan.');
        console.log(error);
    }
}

// GET /user/:alias (Get user by alias from url)
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

// GET /user/get_if_alias/:alias (returns json({found: true/false})
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

// POST /user/login (User login)
const userLogin = async (req, res) => {
    try {
        const alias = req.body.alias;
        const password = req.body.password;
        const user = await UserModel.findOne({ alias: alias});
        const redirectUrl = req.body.redirect || req.headers.referer || '/';
        if (user) {
            // Check password
            if(bcrypt.compareSync(password, user.password)){
                req.session.user = { 
                    alias: req.body.alias,
                    userId: user.id,
                    isLoggedIn: true
                };
                await req.session.save();
                req.flash('info', 'Olet kirjautunut sisään');
                console.log(redirectUrl);
                res.redirect(redirectUrl);
            }
            else {
                req.flash('info', 'Tarkista käyttäjätunnus ja salasana.');
                res.redirect(redirectUrl);
            }
        }
        else {
            req.flash('info', 'Tarkista käyttäjätunnus ja salasana.');
            res.redirect(redirectUrl);
        }
    }
    catch(error) {
        res.status(404).render('index', {
            info: 'Sisäänkirjautuminen ei onnistunut.'
        });
        console.log(error);
    }
}

// GET /profile (Show User Profile Page)
const getUserProfile = async (req, res) => {
    try {
        const userId = req.session.user.userId;
        const user = await UserModel.findOne({ _id: userId });
        const alias = user.alias;
        res.status(200).render('profile', {
            pagetitle: 'Profiili',
            userId: userId,
            alias: alias,
            profile: user.toJSON(),
            helpers: { isEqual(a, b) { return a === b; } }
        });
    }
    catch(error) {
        req.flash('info', 'Käyttäjää ei löydy');
        res.status(404).redirect('/');
    }
};

// POST send Email to other user
const sendEmail = async (req, res) => {
    
    const concert = await EventModel.findById(req.body.eventId);
    const concertDate = format(concert.date, 'dd.MM.yyyy', 'fi');
    let artists = "";
    concert.artists.forEach(artist => {
        artists += artist + "\n";
    });

    const emailAddress = req.body.emailAddress;
    const userId = req.session.user.userId;
    const sender = req.session.user.alias;
    const sendTo = req.body.sendTo;
    const message = `Keikan tiedot:\n\n pvm: ${concertDate} \n\n Esiintyjinä: \n ${artists} \n\n Viesti kaverilta:\n ${req.body.emailMessage} \n\n Terveisin ${sender}`;
    await sendMail(emailAddress, sender, sendTo, message);
    res.status(200).redirect('/');
}



// POST /profile (Edit user information on Profile Page)
const updateUser = async (req, res) => {
    const searchedId = req.body.id;
    let alias = req.session.user.alias;
    if (req.body.sanitizingErrors) {
        console.log(req.body.sanitizingErrors);
        try {
            const user = await UserModel.findOne({ _id: searchedId });
            res.render('profile', { 
                pagetitle: 'Profiili',
                userId: req.searchedId,
                alias: alias,
                profile: user.toJSON(),
                helpers: { isEqual(a, b) { return a === b; } },
                info: req.body.sanitizingErrors
            });
            console.log(searchedId);
        }
        catch(error) {
            res.render("index", {
                patetitle: 'Etusivu',
                userId: req.searchedId,
                alias: alias,
                infoArray: 'Käyttäjän lataaminen epäonnistui'
            });
        }
    }
    else {
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
            alias = user.alias;
            res.status(200).render('profile', { 
                pagetitle: 'Profiili',
                userId: searchedId,
                alias: alias,
                profile: user.toJSON(),
                helpers: { isEqual(a, b) { return a === b; } },
                info: 'Muutokset tallennettu.'
            });
        }
        catch(error) {
            res.status(500).render('profile', {
                pagetitle: 'Profiili',
                userId: searchedId,
                alias: alias,
                profile: user.toJSON(),
                helpers: { isEqual(a, b) { return a === b; } },
                info: 'Muutoksia ei voitu tallentaa.'
            });
            console.log(error);
        }
    }
}

// POST /profile/upload/profilepic (Upload new profile pic on Profile Page)
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

// POST /profile/upload/profilepic (Delete profile pic on Profile Page)
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
            pagetitle: 'Profiili',
            userId: userId,
            alias: alias,
            info: 'Test failed'
        });
        console.log(error);
    }
}

// POST /delete-profile (Remove user from db)
const deleteUser = async (req, res) => {
    try {
        req.flash('info', 'Käyttäjätili on poistettu');
        const deleteId = req.body.id;
        const user = await UserModel.findOneAndDelete({ _id: deleteId });
        req.session.destroy();
        res.redirect('/');
    }
    catch(error) {
        res.status(404).render('profile', {
            pagetitle: 'Profiili',
            userId: deleteId,
            alias: alias,
            info: 'Käyttäjäprofiilin poisto ei onnistunut'
        });
        console.log(error);
    }
}

// GET /logout (Logout user, destroy session)
const userLogOut = async (req, res) => {
    try {
        req.flash('info', 'Olet kirjautunut ulos.');
        await req.session.destroy();
        res.redirect('/');
    }
    catch(error) {
        res.status(500).render('index', {
            pagetitle: 'Etusivu',
            info: 'Jotain meni pieleen.'
        });
    console.log(error);
    }
};

module.exports = {
    getUser, addNewUser, getUserByAlias, getBooleanIfAliasInDB, userLogin, 
    getUserProfile, sendEmail, updateUser, uploadProfilePic, deleteProfilePicture, 
    deleteUser, userLogOut 
};