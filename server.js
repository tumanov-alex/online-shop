var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var bodyParser = require('body-parser');
var configDB = require('./config/database.js');
var cookieParser = require('cookie-parser');

// configuration ===============================================================
mongoose.connect(configDB.url);
var session = require('express-session');
var SessionStore = new session.MemoryStore;

require('./config/passport')(passport); // pass passport for configuration

	// set up our express application
app.use(session({
	secret: 'yohooo',
	store: SessionStore,
	resave: true,
	saveUninitialized: true
}));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('views'));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport

app.use(passport.initialize());
app.use(flash()); // use connect-flash for flash messages stored in session
//app.use(app.router());

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('\nBig Brother is listening you on ' + port);
