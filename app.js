const dotenv = require('dotenv');
const cookieSession = require('cookie-session');
const express = require('express');
const passport = require('passport');
const passportSetup = require('./passport')
const cors = require("cors")
const app =express();
const authRoute = require('./routes/auth') 
const cookies = require('cookie-parser')
const session = require('express-session');
const Auth = require('./middleware/Auth');



//require('./passport')
app.use(cookies())

 app.use(cookieSession(
   {
     name:"session" ,
     keys: ["private key"] ,
    maxAge: 20*60*60*100
   }
 ))

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.text())

app.use(cors({
  origin: "https://localhost:3000" ,
  methods: "GET ,PUT , POST ,DELETE" ,
  credentials: true ,
}))

app.use(function(req, res, next) {
  console.log("setting headers...");
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', true);
 res.setHeader('Access-Control-Allow-Headers', 'Origin, X-PINGOTHER ,X-Requested-With, Content-Type, Accept');
 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS');
 next();
});

app.use(session({
  secret: process.env.SECRET_KEY ,
  resave: false , 
  saveUninitialized: false ,
  cookie: {
      httpOnly: true
  }
}))

//database
require('./db/conn')
dotenv.config({ path: './config.env' })


app.use("/auth" , authRoute);



//all routes
app.get("/", Auth ,(req, res) => {
    res.send(req.Auth);
})

//Register
app.post('/register/:name/:email/:pass' ,require('./routes/register') ) ;

//Login
app.post('/login/:pass/:email' , require('./routes/login'));

//see all users
app.get('/manage' , Auth , require('./routes/user'));

//view user role
app.post("/viewrole/:id" , Auth , require('./routes/viewrole'));

//delete user
app.post("/manage/:id",Auth , require('./routes/deleteuser'));

//add role
app.post("/addrole/:id/:role", Auth ,require('./routes/addrole'));

//Profile
app.get('/profile' , Auth , (req , res) =>{
    console.log("Hello Profile");
    res.send(req.result);
})

//Logout
app.get('/logout' ,Auth ,async (req ,res) =>{
    console.log("Clearing cookies");
    res.clearCookie('session')
    res.clearCookie('JWT')
    res.clearCookie('session.sig')
    res.send({message:"Logout Successfully"});
})

app.get('/role' , Auth ,(req,res) =>{
    res.send(req.isAdmin);
})

app.post("/loginwfb/:name/:email/:id" , require('./routes/Loginwfb'))

app.listen("8000" , ()=>{
  console.log("server is running at port 8000")
})

