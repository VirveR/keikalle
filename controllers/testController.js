//Database connection
const mongoose = require('mongoose');
require('dotenv').config();
const conString = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DB}?retryWrites=true&w=majority&appName=Keikalle`

mongoose.connect(conString)
.then(() => {
    console.log('testController connected to database');
})
.catch((error) => {
    console.log(error);
});

const UserModel = require('../models/User');

//GET home
const getHome = (req, res) => {
    res.render('index', {userPressesLoginButtonShowThis: true});
}

//UPDATE profile information
const updateProfile = async (req, res) => {
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
            birthYear: req.body.birthYear});
    res.render('profile', user);
}

module.exports = {getHome, updateProfile};