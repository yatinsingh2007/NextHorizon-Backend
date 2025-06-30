const mongoose = require('mongoose');

const oppertunitySchema = mongoose.Schema({
    name : {
        type : String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100,
        ref : 'User'
    },
    photo : {
        type : String,
        default: 'https://res.cloudinary.com/dz1qj3x8h/image/upload/v1735681234/nextHorion/defaultOppertunityImage.png'
    },
    job : {
        type : String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    company : {
        type : String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    bio : {
        type : String,
        trim: true,
        minlength: 10,
        maxlength: 500
    }

})

const Oppertunity = mongoose.model('Oppertunity', oppertunitySchema);
module.exports = Oppertunity;