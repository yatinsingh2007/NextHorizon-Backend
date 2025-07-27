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
                    expiresIn: '3h'
                });
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "None",
                  })
                  .status(200)
                  .send({ message: 'Login Successful', user: user[0] });
            } else {
                res.status(401).send('Invalid Credentials');
            }
        }
    }catch(err){
        console.log(err.message)
        res.status(500).send('Internal Server Error');
    }
})

authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const hashedPassword = await passwordHasher.hash(password, 10);

    const ourUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await ourUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: 'Bad Request' });
  }
});

authRouter.get('/logout' , (req , res) => {
    res.cookie("token" , null , {
        expires : new Date(Date.now()),
        httpOnly : true,
        secure : true,
        sameSite : "None"
    }).status(200).send({ message: 'Logout Successful' });
})

module.exports = authRouter;