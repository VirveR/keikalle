//Database connection
const mongoose = require('mongoose');
require('dotenv').config();
const conString = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DB}?retryWrites=true&w=majority&appName=Keikalle`
// For crypting passwords
const bcrypt = require('bcryptjs');

mongoose.connect(conString)
.then(() => {
    console.log('userController connected to database');
})
.catch((error) => {
    console.log(error);
});

const UserModel = require('../models/User');


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

//GET user by id --> profile
const getUserById = async (req, res) => {
    try {
        const searchedId = req.params.id;
        const user = await UserModel.findOne({ _id: searchedId });
        res.render('profile', {
            info: 'Käyttäjän hakeminen onnistui',
            profile: user.toJSON()
        });
        console.log(user);
    }
    catch(error) {
        res.status(404).render('profile', {
            info: 'Test failed'
        });
        console.log(error);
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
                console.log("salasana oikein")
                res.render('profile', {
                    info: 'Käyttäjän hakeminen onnistui',
                    profile: user.toJSON()
                });
                console.log(user);
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
        const userFromDb = await UserModel.findOne({ alias: alias});

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
        const userFromDb = await UserModel.findOne({ alias: alias});
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
    const searchedId = req.params.id;
    const user = await UserModel.findOneAndUpdate({ _id: searchedId }, 
        {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            alias: req.body.alias,
            email: req.body.email,
            password: req.body.password,
            city: req.body.city,
            gender: req.body.gender,
            birthYear: req.body.birthYear},
        {new: true}
        );
    res.render('profile', { profile: user.toJSON() });
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

module.exports = {getUser, getUserByAlias, getUserById, userLogin, addNewUser, getBooleanIfAliasInDB, updateUser, deleteUser};