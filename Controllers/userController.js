const express = require("express")
const jwt = require("jsonwebtoken")
const userModel = require("../Models/userModel")
const cookieParser = require("cookie-parser")

const isLoggedIn = require("../Middlewares/isLoggedIn")

const app = express()
app.use(cookieParser())


const registerUser = async (req, res) => {
    const { username, password, email } = req.body;

    const data = await userModel.findOne( {$or : [{ username }, {email}]});

    if (data) {
        res.json("username or email already exist")
    }
    else {
        const createData = await userModel.create({
            // name,
            password,
            email,
            username
        })

        const token = jwt.sign({ username }, process.env.SECRET);
        res.cookie("token", token)
        res.json(createData);
    }
}


const loginUser = async (req, res) => {
    const { username, password } = req.body;
    const data = await userModel.findOne({ username });
    // console.log("data === " , data)

    if (!data) {
        res.json(`There is no user with username ${username}`)
    }
    else {
        if (password === data.password) {
            const token = jwt.sign({ username }, process.env.SECRET);
            // console.log(token)

            res.cookie("token", token)

            // console.log("login se console " , req.cookies)
            res.json(`Welcome ${username} , you are logged in`)
        }
        else {
            res.json("Your password is incorrect");
        }
    }
}

const logout = (req,res) => {
    res.cookie("token" , "")
    res.json("cookie erased redirected to /login")
}

module.exports = { registerUser, loginUser , logout}