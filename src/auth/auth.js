require('dotenv').config();
const express = require('express');
const User = require('../models/User');
const authRouter = express.Router();
const passwordHasher = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

authRouter.use(express.json());
authRouter.use(cookieParser());

authRouter.post('/login' , async (req , res) => {
    try{
        const { email, password } = req.body;
        const user = await User.find({email})
        if (user.length === 0){
            res.status(404).send('User not Found Invalid Credentials')
        }else{
            const isPasswordValid = await passwordHasher.compare(password, user[0].password);
            if (isPasswordValid) {
                const token = jwt.sign({_id : user[0]._id} , process.env.JWT_SECRET, {
                    expiresIn: '1h'
                });
                res.cookie("token" , token).status(200).send({ message: 'Login Successful', user: user[0] });
            } else {
                res.status(401).send('Invalid Credentials');
            }
        }
    }catch(err){
        res.status(500).send('Internal Server Error');
    }
})

authRouter.post('/register' , async (req , res) => {
    try {
       const { password } = req.body;
       const hasedpassword = await passwordHasher.hash(password, 10);
       const user = new User({ ...req.body, [password]: hasedpassword });
       await user.save();
       res.status(201).send({ message: 'User Registered Successfully', user });
    }catch(err) {
        res.status(404).send('Something went wrong');
    }
})

authRouter.get('/logout' , (req , res) => {
    res.cookie("token" , null , {
        expires : new Date(Date.now())
    }).status(200).send({ message: 'Logout Successful' });
})