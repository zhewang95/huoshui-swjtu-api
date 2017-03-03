/**
 * Created by wz on 17-3-1.
 */
var express = require('express'),
    path = require('path'),
    mongoose = require('mongoose'),
    dbConnector = require('./dbConnector'),
    passport = require('passport'),
    session = require('express-session'),
    dbCached = require('connect-mongo')(session),
    bodyParser = require('body-parser'),
    setupPassport = require('./setupPassport'),
    router = require('./router.js');

var app = express();
dbConnector();
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: 'kitten',
    resave: true,
    saveUninitialized: true,
    store: new dbCached({
        mongooseConnection: mongoose.connection
    })
}));
app.use(passport.initialize());
app.use(passport.session());
setupPassport();

app.use(function (req, res, next) {
    res.success = function (status) {
        if (!status)status = 'success';
        res.send({statuscode: 0, status: status});
    };
    res.failed = function (status) {
        if (!status)status = 'failed';
        res.send({statuscode: -1, status: status});
    };
    next();
});

app.use(router);

app.listen(3001, function () {
    console.log('start listening at 3001');
});