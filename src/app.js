const express = require('express');
const connectDB = require('./DataBase/dbConfig')
const User = require('./models/User')
const app = express();
const cors = require('cors');
const authRouter = require('./auth/auth')
const Post = require('./models/Posts');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const userAuthCheck = require('./middleware/userauthCheck');

app.use(express.json());
app.use(cookieParser())

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use('/auth', authRouter);

app.get ('/feed', userAuthCheck , async (req , res) => {
    try{
        const users = await Post.find({})
        if (users.length === 0) {
            return res.status(404).json({ message: 'No posts found' });
        }
        res.status(200).json(users);
    }catch(err){
        console.error('Error fetching posts:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

app.patch('/update' , userAuthCheck , async(req , res) => {
    try{
        const user = req.user
        let body = req.body

        const updatedUser = await User.findByIdAndUpdate(user._id , req.body)
        res.status(200).json({
            "message" : "user Updated Successfully",
            "body" : updatedUser
        })
    }catch(err){
        res.status(500).send('Internal Server Error.')
    }
})
app.get('' , async (req , res) => {
    const token = req.query.token
    const ourUser = jwt.verify(token , process.env.JWT_SECRET)
    try{
        const client = await User.find({_id : ourUser._id})
        return res.status(200).json({
            'message' : 'user exists',
            'user_data' : client
        })
    }catch(err){
        res.status(400).send('Bad Request')
    }
})

app.patch('/feed/like', userAuthCheck, async (req, res) => {
  try {
    const our_user = req.user;
    const { _id  , isLikeClicked } = req.body;

    if (!_id) {
      return res.status(400).send('Post ID is required');
    }
    if (isLikeClicked === true){
        const updatedPost = await Post.findByIdAndUpdate(
        _id,
        {
            $inc: { likes: 1 },
            $addToSet: { likedBy: our_user._id },
            $pull : {dislikedBy : our_user._id}
        },
        { new: true }
        );
        return res.status(200).send(updatedPost);
    }else{
         const updatedPost = await Post.findByIdAndUpdate(
        _id,
        {
            $inc: { likes: -1 },
            $pull: { likedBy: our_user._id }
        },
        { new: true }
        );
        return res.status(200).send(updatedPost);
    }

  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
});

app.patch('/feed/dislike' , userAuthCheck ,  async (req , res) => {
    try{
        const our_user = req.user
        const {_id , isLikeClicked } = req.body
        if (!_id){
            return res.status(400).send('Post id must be provided')
        }
        if (isLikeClicked === false){
            const updatedUser = await Post.findByIdAndUpdate(
            _id , 
            {
                $inc : {likes : -1},
                $addToSet : {dislikedBy : our_user._id},
                $pull : {likedBy : our_user._id}
        } , {new : true})
        return res.status(200).send(updatedUser)
        }else{
            const updatedUser = await Post.findByIdAndUpdate(
            _id , 
            {
                $inc : {likes : 1},
                $pull : {dislikedBy : our_user._id}
        } , {new : true})
        return res.status(200).send(updatedUser)
        }
    }catch(err){
        return res.status(500).send('Internal Server Error')
    }
})

connectDB()
    .then(() => {
        app.listen(7777 , () => {
            console.log('Server is running on port 7777');
        })
    }).catch((err) => {
        console.log('connect Failed:', err);
    })