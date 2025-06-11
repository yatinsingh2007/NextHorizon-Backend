const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    title : {
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
    location : {
        type : String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100,
        default: 'Remote'
    },
    type : {
        type :String,
        required: true,
    },
    description : {
        type : String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 500
    },
    logo : {
        type : Stirng,
        default: 'https://res.cloudinary.com/dz1qj3x8h/image/upload/v1735681234/nextHorion/defaultCompanyLogo.png'
    }
} , {
    timestamps: true
})

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;