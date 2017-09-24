var LocalStrategy   = require('passport-local').Strategy;
const bCrypt = require('bcrypt-nodejs');

const mongoose = require('mongoose');
var User = mongoose.model('User');
var Post = mongoose.model('Post');
//temporary data store
var users = {};
module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
	passport.serializeUser(function(user, done) {
		console.log('serializing user: ',user.username);
		//return the unique id for the user
		done(null, user.username);
	});

	//Desieralize user will call with the unique id provided by serializeuser
	passport.deserializeUser(function(username, done) {

		return done(null, users[username]);

	});

	passport.use('login', new LocalStrategy({
			passReqToCallback : true
		},
		function(req, username, password, done) { 

			if(!users[username]){
				console.log('User Not Found with username '+username);
				return done(null, false);
			}

			if(isValidPassword(users[username], password)){
				//sucessfully authenticated
				return done(null, users[username]);
			}
			else{
				console.log('Invalid password '+username);
				return done(null, false)
			}
		}
	));

	passport.use('signup', new LocalStrategy({
			passReqToCallback : true // allows us to pass back the entire request to the callback
		},
		function(req, username, password, done) {
			User.findOne({username: username},function(err, user){
				if(err){
					return done(err,false);
				}
				if(user){
					//user already signed up, so it's not possible to to signed it once again
					return done('username already taken',false);
				}
				var user = new User();
				user.username = username;
				user.password = createHash(password);
				user.save(function(err, user){
					if(err){
						return done(err, user);
					}
					console.log('user successfully signed up: '+username);
					return done(null,user);
				});

			});
			if (users[username]){
				console.log('User already exists with username: ' + username);
				return done(null, false);
			}		
		})
	);
	
	var isValidPassword = function(user, password){
		return bCrypt.compareSync(password, user.password);
	};
	// Generates hash using bCrypt
	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};

};