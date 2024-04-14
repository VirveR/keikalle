const express = require('express');
const app = express();
require('dotenv').config();

//Routing
app.use(express.json());
app.use('', require(__dirname +'/routes/testRoutes'));
app.use('', require(__dirname +'/routes/users'));
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));


//Rendering
const exphbs = require('express-handlebars');

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine', 'handlebars');

//Listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
