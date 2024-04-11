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

const Test = require('../models/Test');


//GET home
const getHome = (req, res) => {
    res.render('index');
}

//GET test
const getTests = async (req, res) => {
    try {
        const tests = await Test.find();
        res.render('test', {
            title: 'Test successful',
            tests: tests.map(doc => doc.toJSON())
        });
    }
    catch {
        res.status(404).render('test', {
            title: 'Test failed'
        });
        console.log(error);
    }
};

module.exports = {getHome, getTests};