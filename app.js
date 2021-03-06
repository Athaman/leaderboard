//  reads the .env file for our database connection details
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');

const routes = require('./routes/main');
const secureRoutes = require('./routes/secure');

const app = express();

const dbString = process.env.MONGO_CONNECTION_URL;
mongoose.connect(dbString, { useNewUrlParser: true, useCreateIndex: true });
mongoose.connection.on('error', (error) => {
    console.log(error);
    process.exit(1);
});
mongoose.connection.on('connected', () => {
    console.log('successfully connected to mongo in the cloud');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

require('./auth/auth');

app.get('/game.html', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.sendFile(__dirname + '/public/game.html');
})

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => { // caution tutorial showed using function not arrow
    res.sendFile(__dirname + '/index.html');
})
app.use('/', routes);
app.use('/', passport.authenticate('jwt', { session: false}), secureRoutes);

app.use((req, res, next) => {
    res.status(404);
    res.json({ message: '404 - nothing to see here'});
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({ error : err });
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
});