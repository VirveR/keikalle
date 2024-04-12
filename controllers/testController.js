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

//GET home
const getHome = (req, res) => {
    res.render('index');
}

module.exports = {getHome};