var flash = require('connect-flash');
var User = require('../app/models/user');
var fs = require("fs");
var multer  = require('multer');
var upload = multer();

module.exports = function (app, passport) {

	app.locals.answerObj = {
		messageSuccess: null,
		messageFailure: null,
		shown: false
	};

	function Answer(failureOrSuccessFlag, str) {
		if(failureOrSuccessFlag) {
			app.locals.answerObj.messageSuccess = str;
			app.locals.answerObj.messageFailure = null;
		} else {
			app.locals.answerObj.messageFailure = str;
			app.locals.answerObj.messageSuccess = null;
		}
		app.locals.answerObj.shown = false;
	}

	app.post('/file_upload', function (req, res) {
		var uploadingFileType = req.files.photo.type;
		uploadingFileType = uploadingFileType.split('/');

		if(uploadingFileType[0] != 'image'){
			Answer(false, 'Only images can be uploaded');
		}
		else{
			upload.single('photo');
			var path = __dirname.split('\\');
			path.splice(path.length-1, 1);
			path = path.join('\\');
			path += "views\\uploads\\" + req.files.photo.originalFilename;

			fs.readFile(req.files.photo.path, function (err, data) {
				fs.writeFile(path, data, function () {
					Answer(true, "Uploaded");

					User.findOneAndUpdate({'user.id': req.user.user.id}, {'user.image': req.files.photo.originalFilename}, function (err, user) {
						if (err) throw err;

						app.locals.user = user;
					});
				});
			});
		}

		res.redirect('/profile');
	});

	app.get('/items', isLoggedIn, function (req, res) {
		var user_id;
		if(req.user.item.user_id) {
			user_id = req.user.item.user_id;
		} else {
			user_id = req.user.user.id;
		}

		User.find({'item.user_id': user_id}, function(err, items) {
			if(err) throw err;

			res.render('items.ejs', {
				items: JSON.stringify(items)
			});
		});
	});

	app.post('/my-items', function (req, res) {
		res.redirect('/items');
	});

	app.post('/delete-item', function (req, res) {
		User.findOneAndRemove({'item.id': req.user.item.id}, function (err, item) {
			if (err) throw err;

			res.redirect('/items');
		});
	});

	app.post('/create-item', function(req, res) {
		upload.single('photo');

		var dirname = __dirname;
		var path = dirname.substring(0, dirname.length - 3);
		path += "views\\uploads\\" + req.files.photo.originalFilename;
		fs.readFile(req.files.photo.path, function (err, data) {
			fs.writeFile(path, data, function (err) {
				if (err) {
					console.log(err);
				}
			});
		});

		passport.authenticate('item-create', {
			successRedirect: '/items',
			failureRedirect: '/profile',
			failureFlash : true
		})(req, res);
	});

	app.get('/delete-photo', function (req, res) {
		User.findOneAndUpdate({'user.email': req.user.user.email}, {'user.image': ''}, function(err, user) {
			if(err) throw err;

			app.locals.user = user;
			res.redirect('/profile');
		})
	});

	app.get('/change-pass', function (req, res) {
		if (req.user.validPassword(req.query.oldPassword)) {
			User.findOneAndUpdate({'user.password': req.user.user.password}, {'user.password': req.user.generateHash(req.query.newPassword)}, function (err) {
				if(err) throw err;
			});
			Answer(true, 'Password successfully changed');
		}else{
			Answer(false, 'Wrong current password');
		}
		res.redirect('/profile');
	});

	app.get('/change-email', function (req, res) {
		User.findOneAndUpdate({'user.email': req.user.user.email}, {'user.email': req.query.email}, function (err) {
			if (err) throw err;
		});
		Answer(true, 'Email successfully changed');
		res.redirect('/profile');
	});

	app.get('/change-phone', function (req, res) {
		User.findOneAndUpdate({'user.phone': req.user.user.phone}, {'user.phone': req.query.phone}, function (err) {
			if (err) throw err;
		});
		Answer(true, 'Phone successfully changed');
		res.redirect('/profile');
	});

	app.get('/find-user', function (req, res) {
		User.find({'user.email': req.query.email}, function (err, user) {
			if (err) throw err;

			try{
				var userName = user[0].user.name;
				var userPhone = user[0].user.phone;

				var answer = 'email: ' + user[0].user.email + ', ';
				if (userName != '' && userName != undefined) {
					answer += 'name: ' + userName + ', ';
				}
				if (userPhone != '' && userPhone != undefined) {
					answer += 'phone: ' + userPhone;
				}
				Answer(true, answer);
			}
			catch(err){
				Answer(false, 'There is no user with this email');
			}

			res.redirect('/profile');
		});
	});

	function wasMessageShown(obj) {
		if(obj.shown) {
			obj.messageSuccess = null;
			obj.messageFailure = null;
			obj.shown  		   = false;
		}
		else if(obj.messageSuccess || obj.messageFailure) {
			obj.shown = true;
		}
	}

	app.get('/profile', isLoggedIn, function (req, res) {
		wasMessageShown(app.locals.answerObj);

		if(!app.locals.user) {
			app.locals.user = req.user;
		}
		console.log(req);
		res.render('profile.ejs', {
			messageSuccess: app.locals.answerObj.messageSuccess,
			messageFailure: app.locals.answerObj.messageFailure
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

	app.get('/logout', function(req, res) {
		delete app.locals.user;
		req.logout();
		res.redirect('/');
	});
};

function isLoggedIn(req, res, next) {
	console.log('\nlogger');
	console.log(req.user);
	if (req.isAuthenticated())
		return next();

	res.redirect('/login');
}