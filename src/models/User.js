const mongoose = require('mongoose');
const validator = require('validator');
const userSchema = mongoose.Schema({
    name : {
        type : String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email : {
        type : String,
        required : true,
        unique: true,
        trim: true,
        index : 1,
        validate : {
            function(value){
                if (!validator.isEmail(value)) {
                    throw new Error('Invalid Email');
                }
                return
            }
        }
    },
    password : {
        type : String,
        required : true,
        validat : {
            function(value){
                if (!validator.isStrongPassword(value)){
                    throw new Error('Password must be Strong')
                }
                return
            }
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
        type: String,
        unique: true,
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
    }
})


const User = mongoose.model('User', userSchema);
module.exports = User;