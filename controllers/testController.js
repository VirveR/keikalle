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

//GET home
const getHome = (req, res) => {
    res.render('index', {userPressesLoginButtonShowThis: true});
}

//GET user by id --> profile
const getUserById = async (req, res) => {
    const user = await UserModel.findOne({ id: req.params.id });
    res.render(profile, user)
}

module.exports = {getHome, getUserById};