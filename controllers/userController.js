//Database connection
const mongoose = require('mongoose');
require('dotenv').config();
const conString = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DB}?retryWrites=true&w=majority&appName=Keikalle`
// For crypting passwords
const bcrypt = require('bcryptjs');

const fs = require('fs');
const path = require('path');

mongoose.connect(conString)
.then(() => {
    console.log('userController connected to database');
})
.catch((error) => {
    console.log(error);
});

const UserModel = require('../models/User');

const upload = require('../middlewares/upload');


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
                res.render('profile', {
                    info: 'Käyttäjän hakeminen onnistui',
                    profile: user.toJSON(),
                    helpers: { isEqual(a, b) { return a === b; } }
                });
            }
            else {
                res.render('user');
            }
        }
        else {
            res.render('user');
        }
    }
    catch(error) {
        res.status(404).render('profile', {
            info: 'Test failed'
        });
        console.log(error);
    }
}

// Add new user to DB (data from a form)
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
            res.json({found : true});
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
    try {
        const searchedId = req.body.id;
        const alias = req.body.alias;
        const userFromDb = await UserModel.findOne({alias: { $regex : new RegExp("^" + alias + "$", "i") }});

        if (!userFromDb) {
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
                helpers: { isEqual(a, b) { return a === b; } } });
        }
        else if (userFromDb.id === searchedId) {
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
                helpers: { isEqual(a, b) { return a === b; } } });
        }
        else {
            const user = await UserModel.findById(searchedId);
            res.render('profile', {
                info: 'Nimimerkki on jo varattu.',
                profile: user.toJSON(),
                helpers: { isEqual(a, b) { return a === b; }}
            });
        }
    }
    catch(error) {
        res.status(500).render('profile', {
            info: 'Upadate failed'
        });
        console.log(error);
    }
}

//UPDATE profile picture
const uploadProfilePic = async (req, res) => {
    const userId = req.body.userIdForPictureUpload;
    const user = await UserModel.findOne({ _id: userId })
    
    // renaming file
    var tmp_path = req.file.path;
    var filename = userId + path.extname(req.file.originalname);    
    var target_path = './public/images/profileimages/' + filename;

    var src = fs.createReadStream(tmp_path);
    var dest = fs.createWriteStream(target_path);

    src.pipe(dest);
    src.on('end', function() {
        UserModel.findById(userId).then((user) => {
            user.imageSrc = filename;
            user.save();
        })
        res.redirect('/profile');
    });
    src.on('error', function(err) { 
        res.render('profile', { 
            profile: user.toJSON(),
            helpers: { isEqual(a, b) { return a === b; } } 
        });  
    });
    src.on('close', function(){
        fs.unlinkSync(tmp_path);
    });    
}

//DELETE user
const deleteUser = async (req, res) => {
    try {
        console.log(req.body.id);
        const deleteId = req.body.id;
        const user = await UserModel.findOneAndDelete({ _id: deleteId });
        res.render('index');
        console.log(user);
        console.log('poistettu');
    }
    catch(error) {
        res.status(404).render('profile', {
            info: 'Test failed'
        });
        console.log(error);
    }
}

module.exports = {getUser, getUserByAlias, getUserProfile, userLogin, addNewUser, getBooleanIfAliasInDB, updateUser, uploadProfilePic, deleteUser};