const mongoose = require('mongoose');
const validator = require('validator');
const postSchema = mongoose.Schema({
    type : {
        type : String,
        required: true,
    },
    title : {
        type : String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    description : {
        type : String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 500
    },
    company : {
        type : String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    tags : {
        type : [String]
    },
    companyLogo : {
        type : String,
        default: 'https://res.cloudinary.com/dz1qj3x8h/image/upload/v1735681234/nextHorion/defaultCompanyLogo.png'
    },
    postImage : {
        type : String,
        default: 'https://res.cloudinary.com/dz1qj3x8h/image/upload/v1735681234/nextHorion/defaultPostImage.png'
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0,
    },
    likedBy : {
        type : [mongoose.Schema.Types.ObjectId],
        default : [],
        ref : 'User'
    },
    dislikedBy : {
        type : [mongoose.Schema.Types.ObjectId],
        default : [],
        ref : 'User'
    },
    interested : {
        type : [mongoose.Schema.Types.ObjectId],
        default : [],
        ref : 'User'
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    }
} , {
    timestamps: true
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;