//Database connection
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
            if(user.password === password){
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
        // create a document
        const newUser = new UserModel(req.body);
        // save the data to db
        await newUser.save();
        res.render('user', {
            info2: 'Adding was a success'
        });
    }
    catch(error) {
        res.status(500).render('user', {
            info2: 'Adding failed'
        });
        console.log(error);
    }
}

module.exports = {getUser, getUserByAlias, getUserById, userLogin, addNewUser};