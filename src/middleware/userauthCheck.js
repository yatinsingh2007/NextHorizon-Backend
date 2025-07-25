require('dotenv').config()
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const userAuthCheck = async (req , res , next) => {
    if (req.cookies){
        console.log(req.cookies, "req.cookies")
        const cookie_token = req.cookies['token']
        console.log(cookie_token)
        if (!cookie_token) return res.status(401).send(`User Unauthorised`)
        try{
            const id = jwt.verify(cookie_token , process.env.JWT_SECRET)
            const ourUser = await User.find({_id : id})
            if (!ourUser) return res.status(404).send(`User not Found`)
            req.user = ourUser
            next()
        }catch(err){
            res.status(400).json({
                'message' : 'Bad Request'
            })
        }

    }else{
        res.status(401).send(`User Unauthorised`)
    }
}

module.exports = userAuthCheck