var LocalStrategy   = require('passport-local').Strategy;
var User       		= require('../app/models/user');

module.exports = function(passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, but we will override with email
        usernameField : 'email',
        passwordField : 'password',
        nameField     : 'name',
        phoneField    : 'phone',
        imageField    : 'image',
        idField       : 'id',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
        User.findOne({ 'user.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

				// if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.user.email    = email;
                newUser.user.password = newUser.generateHash(password);
                newUser.user.name = req.body.name;
                newUser.user.phone = req.body.phone;
                newUser.user.id = newUser._id;
                // function
                // in our user model

				// save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }
        });
    }));

    // =========================================================================
    // LOCAL ITEM
    // =============================================================
    // =========================================================================
    passport.use('item-create', new LocalStrategy({
            usernameField   : 'title',
            passwordField   : 'price',
            idFiled         : 'id',
            created_atField : 'created_at',
            imageField      : 'image',
            user_idField    : 'user_id',
            creatorField    : 'creator',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            var newItem      = new User();
            var milliseconds = new Date();
            var date         = (milliseconds.getMonth()+1) + '/' + milliseconds.getDate() + '/' + milliseconds.getFullYear();

            newItem.item.title      = req.body.title;
            newItem.item.created_at = date;
            newItem.item.id         = newItem._id;
            newItem.item.price      = req.body.price;
            newItem.item.image      = req.files.photo.originalFilename;
            newItem.item.user_id    = req.body.user_id;

            newItem.save(function(err) {
                if (err)
                    throw err;
                return done(null, newItem);
            });
        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'user.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });
    }));
};
