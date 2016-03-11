// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 1488;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var bodyParser = require('body-parser');
var multer  = require('multer');
var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	//app.use(connect.cookieSession({ secret: 'tobo!', cookie: { maxAge: 60 * 60 * 1000 }}));
	app.use(express.bodyParser()); // get information from html forms
	app.use(bodyParser.json());
	app.use(express.static('views'));
	app.use(bodyParser.urlencoded({extended: true}));

	app.set('view engine', 'ejs'); // set up ejs for templating

	// required for passport
	app.use(express.session({
			secret: 'yohooo',
			resave : true,
			saveUninitialized : true
	})); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session
	//app.use(app.router());
});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('On ' + port);
