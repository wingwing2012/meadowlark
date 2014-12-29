/**
 * The application file for the meadowlark project
 */
var express = require('express');
var fortune = require('./lib/fortune.js');
var bodyParser = require('body-parser');
var app = express();
// Set the engine to handlebars
var handlebars = require('express-handlebars').create({
	defaultLayout : 'main',
	helpers : {
		section : function(name, options) {
			if (!this._sections)
				this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});

function getWeatherData() {
	return {
		locations : [ {
			name : 'Portland',
			forecastUrl : 'http://www.wunderground.com/US/OR/Portland.html',
			iconUrl : 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
			weather : 'Overcast',
			temp : '54.1 F (12.3 C)'
		}, {
			name : 'Bend',
			forecastUrl : 'http://www.wunderground.com/US/OR/Bend.html',
			iconUrl : 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
			weather : 'Partly Cloudy',
			temp : '55.0 F (12.8 C)'
		}, {
			name : 'Manzanita',
			forecastUrl : 'http://www.wunderground.com/US/OR/Manzanita.html',
			iconUrl : 'http://icons-ak.wxug.com/i/c/k/rain.gif',
			weather : 'Light Rain',
			temp : '55.0 F (12.8 C)'
		}, ]
	};
}
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

// Test using mocha
app.use(function(req, res, next) {
	res.locals.showTests = app.get('env') !== 'production'
			&& req.query.test === '1';
	next();
});

app.use(function(req, res, next) {
	if (!res.locals.partials)
		res.locals.partials = {};
	res.locals.partials.weather = getWeatherData();
	next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : true
}));

var credentials = require('./credentials.js');
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')());

app.use(function(req, res, next) {
	// if there's a flash message, transfer
	// it to the context, then clear it
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});
var nodemailer = require('nodemailer');
var mailTransport = nodemailer.createTransport('SMTP', {
	host : 'smtp.qq.com',
	secureConnection : true, // use SSL
	port : 465,
	auth : {
		user : credentials.meadowlarkSmtp.user,
		pass : credentials.meadowlarkSmtp.password,
	}
});
// Handle the normal path
app.get('/', function(req, res) {
	res.render('home');
});
app.get('/about', function(req, res) {
	res.render('about', {
		fortune : fortune.getFortune(),
		pageTestScript : '/qa/tests-about.js'
	});
});

app.get('/tours/hood-river', function(req, res) {
	res.render('tours/hood-river');
});
app.get('/tours/request-group-rate', function(req, res) {
	res.render('tours/request-group-rate');
});

app.get('/nursery-rhyme', function(req, res) {
	res.render('nursery-rhyme');
});
app.get('/data/nursery-rhyme', function(req, res) {
	res.json({
		animal : 'squirrel',
		bodyPart : 'tail',
		adjective : 'bushy',
		noun : 'heck'
	});
});
app.get('/newsletter', function(req, res) {
	// we will learn about CSRF later...for now, we just
	// provide a dummy value
	res.render('newsletter', {
		csrf : 'CSRF token goes here'
	});
});
app.post('/process', function(req, res) {
	if (req.xhr || req.accepts('json,html') === 'json') {
		// if there were an error, we would send { error: 'error description' }
		res.send({
			success : true
		});
	} else {
		// if there were an error, we would redirect to an error page
		res.redirect(303, '/thank-you');
	}
});
app
		.post(
				'/newsletter',
				function(req, res) {
					var name = req.body.name || '', email = req.body.email
							|| '';
					// input validation
					if (!email.match(VALID_EMAIL_REGEX)) {
						if (req.xhr)
							return res.json({
								error : 'Invalid name email address.'
							});
						req.session.flash = {
							type : 'danger',
							intro : 'Validation error!',
							message : 'The email address you entered was not valid.',
						};
						return res.redirect(303, '/newsletter/archive');
					}
					new NewsletterSignup({
						name : name,
						email : email
					})
							.save(function(err) {
								if (err) {
									if (req.xhr)
										return res.json({
											error : 'Database error.'
										});
									req.session.flash = {
										type : 'danger',
										intro : 'Database error!',
										message : 'There was a database error; please try again later.',
									}
									return res.redirect(303,
											'/newsletter/archive');
								}
								if (req.xhr)
									return res.json({
										success : true
									});
								req.session.flash = {
									type : 'success',
									intro : 'Thank you!',
									message : 'You have now been signed up for the newsletter.',
								};
								return res.redirect(303, '/newsletter/archive');
							});
				});
var formidable = require('formidable');

app.get('/contest/vacation-photo', function(req, res) {
	var now = new Date();
	res.render('contest/vacation-photo', {
		year : now.getFullYear(),
		month : now.getMonth()
	});
});
app.post('/contest/vacation-photo/:year/:month', function(req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		if (err)
			return res.redirect(303, '/error');
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		res.redirect(303, '/thank-you');
	});
});

var jqupload = require('jquery-file-upload-middleware');
app.get('/contest/vacation-photo-jq', function(req, res) {
	var now = new Date();
	res.render('contest/vacation-photo-jq', {});
});
app.use('/upload', function(req, res, next) {
	var now = Date.now();
	jqupload.fileHandler({
		uploadDir : function() {
			return __dirname + '/public/uploads/' + now;
		},
		uploadUrl : function() {
			return '/uploads/' + now;
		},
	})(req, res, next);
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next) {
	res.status(404);
	res.render('404');
});
// 500 error handler (middleware)
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function() {
	console.log('Express started on http://localhost:' + app.get('port')
			+ '; press Ctrl-C to terminate.');
});