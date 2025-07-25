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
    mobileNo:{
        type : String,
        trim: true,
        minlength: 10,
        maxlength: 15
    },
    profilePic:{
        type: String,
        default: 'https://www.citypng.com/public/uploads/preview/transparent-hd-white-male-user-profile-icon-701751695035030pj3izxn7kh.png'
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
    } , 
    followerlist : {
        type : [mongoose.Schema.Types.ObjectId] , 
        default : []
    },
    gender : {
        type : String,
        enum : ['male' , 'female' , 'other'],
    },
    education : {
        type : [Object],
        default: []
    },
    work : {
        type : [Object],
        default: []
    },
} , {
    timestamps: true,
})


const User = mongoose.model('User', userSchema);
module.exports = User;