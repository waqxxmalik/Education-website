const express = require('express');
const app = express();
const path = require('path')
mongoose    = require("mongoose"),
passport    = require("passport"),
LocalStrategy = require("passport-local"),	
flash        = require("connect-flash"),
User        = require("./models/user"),
session = require("express-session"),
bodyParser = require("body-parser"),	   
 PORT = process.env.PORT || 2002

 mongoose.connect("mongodb+srv://waqasarif:dravid@cluster0.hn1lhp7.mongodb.net/Mydata?retryWrites=true&w=majority", { useUnifiedTopology: true }
 ,{ useNewUrlParser: true })
.then(() => console.log(`Database connected`))
.catch(err => console.log(`Database connection error: ${err.message}`));
 
var Publishable_Key = "pk_test_51Kiy7xKQfLJz5028SJRA8HNFseyV4HHzU2iNFeOojxuceoyuGf7SWkCOKqGgACLPUij0QNA8wVhiINUIeNpCMpj500Xo25Gumm"
var Secret_Key = "sk_test_51Kiy7xKQfLJz5028GpeCOIoKGZcthgwsYW5mxj60wiId0lk0jEyI3vFun9FHY7Bhs5l72ualQVsmJr74v7Bi81ac00an24L9Up"
 
const stripe = require('stripe')(Secret_Key)


      
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')))
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')
 



app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
}); 

  

  
app.get('/', function(req, res){
    res.render('pages/index', {
    key: Publishable_Key
    })
})


app.post('/payment', function(req, res){
    // Moreover you can take more details from user
    // like Address, Name, etc from form
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'waqas arif',
        address: {
            line1: 'islamabad F7 sectator',
            postal_code: '110092',
            city: 'Islamabad',
            state: 'Punjab',
            country: 'Pakistan',
        }
    })
    .then((customer) => {
 
        return stripe.charges.create({
            amount: 8000,    // Charing Rs 25
            description: 'Web Development Product',
            currency: 'USD',
            customer: customer.id
        });
    })
    .then((charge) => {
        res.send("Success") // If no error occurs
    })
    .catch((err) => {
        res.send(err)    // If some error occurs
    });
})
 
app.get("/contact", function(req, res){
    res.send("succesfully Submitted");
})
app.post("/contact", function(req, res){
    res.send("succesfully Submitted");
})

app.get("/register", function(req, res){
	res.render("register")
})
app.post("/register", function(req, res){
	var newuser = new User({username: req.body.username})
	User.register(newuser, req.body.password, function(err, user){
       if (err){
           req.flash("error", err.message);
           return res.redirect("register");
       }
       passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds") ;
       });
   });
});
app.get("/login", function(req, res) {
    res.render("login");
	req.flash("error", "You must have to Login First")
});

app.post("/login", passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true
    }), function(req, res) {
});
app.get("/logout", function(req, res) {
    req.flash("success", "Come back soon " + req.user.username + "!")
    req.logout();
    res.redirect("/");
});
  
  app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
