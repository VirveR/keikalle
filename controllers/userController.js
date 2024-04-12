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

module.exports = {getUser, getUserByAlias};