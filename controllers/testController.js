//Database connection
const mongoose = require('mongoose');
require('dotenv').config();
const conString = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DB}?retryWrites=true&w=majority&appName=Keikalle`

mongoose.connect(conString)
.then(() => {
    console.log('Connected to database');
})
.catch((error) => {
    console.log(error);
});

const UserModel = require('../models/User');

//GET home
const getHome = (req, res) => {
    res.render('index');
}

//GET user
const getUser = async (req, res) => {
    try {
        const users = await UserModel.find();
        res.render('user', {
            info: 'Käyttäjän hakeminen onnistui',
            users: users.map(user => user.toJSON())
        });
    }
    catch {
        res.status(404).render('user', {
            info: 'Test failed'
        });
        console.log(error);
    }
};

module.exports = {getHome, getUser};