const mongoose = require('mongoose');
const validator = require('validator');
const userSchema = mongoose.Schema({
    name : {
        type : String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
        index : 1
    },
    email : {
        type : String,
        required : true,
        unique: true,
        trim: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: 'Invalid Email'
        }
    },
    password : {
        type : String,
        required : true,
        validate: {
            validator: (value) => validator.isStrongPassword(value),
            message: 'Password must be Strong'
        }
    },
    bachelorsDegree : {
        type : String,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    mastersDegree : {
        type : String,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    mobileNo:{
        type : String,
        trim: true,
        minlength: 10,
        maxlength: 15
    },
    profilePic:{
        type: String,
        default: 'https://res.cloudinary.com/dz1qj3x8h/image/upload/v1735681234/nextHorion/defaultProfilePic.png'
    },
    bio:{
        type: String,
        trim: true,
        maxlength: 500,
        default: 'Hey I am new to NextHorion, let\'s connect and grow together!'
    },
    followers : {
        type : Number, 
        default : 0
    }
})


const User = mongoose.model('User', userSchema);
module.exports = User;