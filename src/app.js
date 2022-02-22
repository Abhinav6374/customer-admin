const express = require("express")
const app = express();
require("./db/conn")
const User = require("./models/user")
const hbs = require("hbs")
const session = require("express-session")
const passport = require('passport');
const localStrategy	= require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const port = process.env.PORT || 8000;


//Middleware

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(session({
	secret: "verygoodsecret",
	resave: false,
	saveUninitialized: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

passport.use(new localStrategy(function (username, password, done) {
	User.findOne({ username: username }, function (err, user) {
		if (err) return done(err);
		if (!user) return done(null, false, { message: 'Incorrect username.' });

		// bcrypt.compare(password, user.password, function (err, res) {
            if(!user.password == password)
			// if (err) return done(err);
		  return done(null, false, { message: 'Incorrect password.' });
			
			return done(null, user);
		// });
	});
}));

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/login');
}

function isLoggedOut(req, res, next) {
	if (!req.isAuthenticated()) return next();
	res.redirect('/');
}

// ROUTES
app.get('/', isLoggedIn, (req, res) => {
	res.render("register");
});

app.get('/register', (req, res) => {
	res.render("userlogin");
});

app.get('/login', isLoggedOut, (req, res) => {
	const response = {
		title: "Login",
		error: req.query.error
	}

	res.render('login', response);
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login?error=true'
}));

app.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

// Setup our admin user
app.get('/setup', async (req, res) => {
	const exists = await User.exists({ username: "admin" });
        
	if (exists) {
		res.redirect('/login');
		return;
	};

	bcrypt.genSalt(10, function (err, salt) {
		if (err) return next(err);
		bcrypt.hash("pass", salt, function (err, hash) {
			if (err) return next(err);
			
			const newAdmin = new User({
				username: "admin",
				password: hash
			});

			newAdmin.save();

			res.redirect('/login');
		});
	});
});
//Create Customer
app.post("/register", async (req, res) => {
  
	try {
	 
  
	  const password = req.body.password;
	  
	  if (password ) {
		const demoRegister = new User({
		  phone: req.body.phone,
		  password: password,
		  
		});
		const registered = await demoRegister.save();
		res.status(201).render("userlogin");
	  } else {
		res.render(`Phone No. or Password is not matching`);
	  }
	} catch (error) {
	  res.status(400).send(error);
	}
  });
// Customer Login
  app.post("/userlogin", async (req, res) => {
	try {
	  const phone = req.body.phone;
	  const password = req.body.password;
	  const userphone = await User.findOne({phone : phone  });
	  
	  if(userphone.password===password){
		  res.status(201).render("welcome")
	  }else{
		  res.send("Invalid Phone No. or Password");
	  }
	  
	} catch (error) {
	  res.status(400).send("Invalid Phone");
	}
  });
  
  app.get("/register",async(req,res)=>{
	  try{
		  const registerData = await User.find();
		  res.send(registerData);
	  }catch(e){
		  res.send(e);
	  }
  })
  
  app.get("/register/:id", async(req,res)=>{
	  try{
		  const _id= req.params.id;
	  const registersData = await User.findById(_id);
	  res.send(registersData);
	  }catch(e){
		  res.send(e)
	  }
  })

app.listen(port,()=>{
console.log(`Listening at port no. ${port}`)
})