require('dotenv').config()
const express = require("express")
const app = express()
const cors = require("cors")
const passport = require("passport")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
app.use(cookieParser()) 

app.use(cors({
  origin: "*"
}))

const Notes = require("./Routes/notes")
const register = require("./Routes/register")
const login = require("./Routes/login")
const logout = require("./Routes/logout")
const Email = require("./Utils/email")

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("<a href='/auth/google'> Login with google </a>")
})


// =====================================================================================================

const GoogleStrategy = require("passport-google-oauth20").Strategy;

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(
  new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://brl-task.onrender.com/auth/google/callback",
  },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile)
    }
  )
);

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

app.get("/auth/google/",
  passport.authenticate("google", { scope: ["profile", "email"] })
)


app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const id = req.user.id;
    const name = req.user.displayName;
    console.log(req.user.emails[0].value)
    console.log(id , name)

    const token = jwt.sign({name} , process.env.SECRET)
    console.log(token)
    res.redirect("/profile")
  }
)

app.get("/profile", (req, res) => {
  // console.log(req.user)
  // console.log(req.user.name)
  // console.log(req.user.emails[0].value)
  // console.log(req.user.name.givenName)
  res.send(`<h1>Welcome ${req.user.displayName} </h1>`)
})


// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++







app.use("/api/notes", Notes);
app.use("/register", register)
app.use("/login", login)
app.use("/logout", logout)
app.use("/",Email)

app.get("/cookie" , (req,res) => {
  res.send(req.cookies)
})


app.listen(process.env.PORT || 3000);