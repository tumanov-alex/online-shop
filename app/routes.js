var flash = require('connect-flash');
var User = require('../app/models/user');
var fs = require("fs");
var multer  = require('multer');
var upload = multer();

module.exports = function (app, passport) {

	app.post('/file_upload', function (req, res) {
		upload.single('photo');
		var dirname = __dirname;
		var path = dirname.substring(0, dirname.length - 3);
		path += "/views/uploads/" + req.files.photo.originalFilename;

		fs.readFile(req.files.photo.path, function (err, data) {
			fs.writeFile(path, data, function (err) {
				if (err) {
					console.log(err);
				} else {
					req.flash('messageSuccess', 'Uploaded');
				}

				User.findOneAndUpdate({'user.email': req.user.user.email}, {'user.image': req.files.photo.originalFilename}, function (err) {
					if (err) throw err;
				});

				req.session.save( function(err){
					if(err) throw err;

					res.redirect('/profile');
				});
			});
		});
	});

	app.get('/delete-photo', function (req, res) {
		User.findOneAndUpdate({'user.email': req.user.user.email}, {'user.image': ''}, function(err, user) {
			if(err) throw err;

			console.log('DELETE');
			console.log(req.user);

			req.session.save( function(err){
				if(err) throw err;

				res.redirect('/profile');
			});
		})
	});

	app.get('/change-pass', function (req, res) {
		if (req.user.validPassword(req.query.oldPassword)) {
			User.findOneAndUpdate({'user.password': req.user.user.password}, {'user.password': req.user.generateHash(req.query.newPassword)}, function (err, user) {
				if(err) throw err;
			});
			req.flash('messageSuccess', 'Password successfully changed');
		}else{
			req.flash('messageFailure', 'Wrong current password');
		}
		res.redirect('/profile');
	});

	app.get('/change-email', function (req, res) {
		User.findOneAndUpdate({'user.email': req.user.user.email}, {'user.email': req.query.email}, function (err, user) {
			if (err) throw err;
		});
		req.flash('messageSuccess', 'Email successfully changed');
		res.redirect('/profile');
	});

	app.get('/change-phone', function (req, res) {
		User.findOneAndUpdate({'user.phone': req.user.user.phone}, {'user.phone': req.query.phone}, function (err, user) {
			if (err) throw err;
		});
		req.flash('messageSuccess', 'Phone successfully changed');
		res.redirect('/profile');
	});

	app.get('/find-user', function (req, res) {
		User.find({'user.email': req.query.email}, function (err, user) {
			if (err) throw err;

			userName = user[0].user.name;
			userPhone = user[0].user.phone;

			var answer = 'email: ' + user[0].user.email + ', ';
			if (userName != '' && userName != undefined) {
				answer += 'name: ' + userName + ', ';
			}
			if (userPhone != '' && userPhone != undefined) {
				answer += 'phone: ' + userPhone;
			}

			req.flash('messageSuccess', answer);

			// there is a bug below: session don't store info fast
			// enough so give it a try several times
			req.session.save( function(err){
				if(err) throw err;
				req.session.working = 'arrived in time';

				res.redirect('/profile');
			});
		});
	});

	app.all('/profile', isLoggedIn, function (req, res) {
		req.session.save(function (err) {
			if (err) throw err;

			res.render('profile.ejs', {
				user: req.user,
				messageSuccess: req.flash('messageSuccess'),
				messageFailure: req.flash('messageFailure')
			});
		});
	});

	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/login',
		failureFlash : true // allow flash messages
	}));

	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/profile',
		failureRedirect: '/signup',
		failureFlash : true // allow flash messages
	}));

	app.get('/create-item', function(req, res) {
		res.render('items.ejs', {
			user: req.user,
			message: req.flash('messageSuccess', 'Item created')
		});
	});

	app.get('/items', function (req, res) {
		console.log(req);

		res.render('items.ejs', {
			item: req.user.item,
			message: req.flash('messageSuccess')
		});
	});

	app.post('/create-item', function(req, res) {
		var items = [];
		var reqUserId = req.user.id;
		User.find({}, function (err, users) {
			if (err) throw err;

			for (var i in users) {
				if(users[i].item.user_id == reqUserId) {
					items.push(users[i].item);
				}
			}
			req.dataProcessed = items;
			console.log(req.dataProcessed);
		});

		upload.single('photo');
		var dirname = __dirname;
		var path = dirname.substring(0, dirname.length - 3);
		path += "/views/uploads/" + req.files.photo.originalFilename;

		fs.readFile(req.files.photo.path, function (err, data) {
			fs.writeFile(path, data, function (err) {
				if (err) {
					console.log(err);
				}
			});
		});

		passport.authenticate('item-create', {
			successRedirect: '/items',
			failureRedirect: '/',
			failureFlash : true
		})(req, res);
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

function isLoggedIn(req, res, next) {

	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
