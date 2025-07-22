const express = require('express');
const connectDB = require('./DataBase/dbConfig')
const User = require('./models/User')
const app = express();
const cors = require('cors');
const authRouter = require('./auth/auth')
const Post = require('./models/Posts');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const upload = multer({dest : 'uploads/'})
const Oppertunities = require('./models/Oppertunities')
require('dotenv').config()

const userAuthCheck = require('./middleware/userauthCheck');

app.use(express.json());
app.use(cookieParser())
app.use('/uploads' , express.static('uploads'))
app.use(cors({
    origin: process.env.front_end_url,
    credentials: true
}))

app.use('/auth', authRouter);

app.get ('/feed', userAuthCheck , async (req , res) => {
    const ourUser = req.user[0]
    try{
        const posts = await Post.find({})
        if (posts.length === 0) {
            return res
            .status(404)
            .json({ message: 'No posts Available' });
        }
        const feedPosts = posts.filter((post) => post.createdBy.toString() !== ourUser._id.toString()
         && !post.likedBy.includes(ourUser._id.toString())
         && !post.dislikedBy.includes(ourUser._id.toString()) 
         && !post.interested.includes(ourUser._id.toString()))
        res.
        status(200)
        .json(feedPosts);
    }catch(err){
        console.log('Error fetching posts:', err.message);
        res
        .status(500)
        .send(`Internal Server Error`)
    }
})

app.patch('/update' , userAuthCheck , async(req , res) => {
    try{
        const user = req.user
        const updatedUser = await User.findByIdAndUpdate(user._id , req.body)
        res
        .status(200)
        .json({
            "message" : "user Updated Successfully",
            "body" : updatedUser
        })
    }catch(err){
        console.log(err.message)
        res
        .status(500)
        .send('Internal Server Error.')
    }
})


app.patch('/feed/like', userAuthCheck, async (req, res) => {
  try {
        const our_user = req.user;
        const { _id  , isLikeClicked } = req.body;

        if (!_id) {
        return res.status(400).send('Post ID is required');
        }
        const ourPost = await Post.findById(_id)
        if (isLikeClicked === true){
        if (!ourPost.likedBy.includes(our_user[0]._id)){
                if (ourPost.dislikedBy.includes(our_user[0]._id)){
                    const index = ourPost.dislikedBy.indexOf(our_user[0]._id)
                    ourPost.dislikedBy.pop(index)
                    ourPost.dislikes -= 1
                }
                ourPost.likedBy.push(our_user[0]._id)
                ourPost.likes += 1
            }else return
        }else{
            if (ourPost.likedBy.includes(our_user[0]._id)){
                const index = ourPost.likedBy.indexOf(our_user[0]._id)
                ourPost.likedBy.pop(index)
                ourPost.likes -= 1
            }
        }
        const updatedPost = await Post.findByIdAndUpdate(_id , {
            likedBy : ourPost.likedBy,
            likes : ourPost.likes,
            dislikedBy : ourPost.dislikedBy,
            dislikes : ourPost.dislikes
        } , {
            new : true
        })
        return res
        .status(200)
        .json({
            'updatedPost' : updatedPost
        })
 } catch (err) {
        console.log(err.message);
        return res
        .status(500)
        .send('Internal Server Error');
  }
});

app.patch('/feed/dislike', userAuthCheck, async (req, res) => {
  try {
        const ourUser = req.user;
        const { _id, isDisLikeClicked } = req.body;
        if (!_id) {
            return res
            .status(400)
            .send('Post id must be provided');
        }

        const ourPost = await Post.findById(_id);
        if (!ourPost) {
            return res
            .status(404)
            .send('Post not found');
        }
        if (isDisLikeClicked === true) {
            if (!ourPost.dislikedBy.includes(ourUser[0]._id)) {
                if (ourPost.likedBy.includes(ourUser[0]._id)){
                    const index = ourPost.likedBy.indexOf(ourUser[0]._id)
                    ourPost.likedBy.pop(index)
                    ourPost.likes -= 1
                }
                ourPost.dislikes += 1;
                ourPost.dislikedBy.push(ourUser[0]._id);
            }
        }else{
            const index = ourPost.dislikedBy.indexOf(ourUser[0]._id)
            ourPost.dislikedBy.pop(index)
            ourPost.dislikes -= 1
        }
        const updatedPost = await Post.findByIdAndUpdate(_id , {
            likedBy : ourPost.likedBy,
            likes : ourPost.likes,
            dislikedBy : ourPost.dislikedBy,
            dislikes : ourPost.dislikes
        } , {
            new : true
        })
        return res
        .status(200)
        .json({ "updatedPost" : updatedPost });
  } catch (err) {
        console.error(err.message);
        return res
        .status(500)
        .json({
            'message' : 'Internal Server Error'
        });
  }
});

app.patch('/post/interested', userAuthCheck , async (req, res) => {
    try{
        const { post_id, user_id } = req.body;
        console.log(post_id , user_id)
        const ourPost = await Post.findById(post_id);
        if (!ourPost) {
        return res.status(404).json({ message: 'Post not found' });
        }

        if (!ourPost.interested.includes(user_id)) {
        ourPost.interested.push(user_id);

        const updatedPost = await Post.findByIdAndUpdate(
            post_id,
            { 
                interested: ourPost.interested 
            },
            {
                new: true 
            }
        );

        return res
        .status(200)
        .json(
            {
                message: 'Interest sent successfully',
                updatedPost,
            }
        );
        } else {
        return res
        .status(200)
        .json(
            { 
                message: 'Your Interest request has already been sent'
            }
        );
        }
    }catch (err) {
        console.error(err.message);
        return res
        .status(500)
        .send('Internal Server Error');
    }
});

app.post('/create/post' , userAuthCheck ,  upload.fields([
    {
        name : 'postImage' ,
        maxCount : 1
    },
    {
        name : 'companyLogo' ,
        maxCount : 1
    }
]) ,  async (req , res) => {
    try{
        const ourUser = req.user[0]
        const _id = ourUser._id
        let {title , company , description , tags , type} = req.body
        tags = req.body.tags.split(',').map((tag) => tag.trim())
        const companyLogo = req.files.companyLogo[0].path
        const postImage = req.files.postImage[0].path
        const newPost = new Post({
            title , 
            company , 
            description , 
            tags , 
            companyLogo , 
            postImage , 
            type , 
            createdBy : _id
        })
        const savedPost = await newPost.save()
        res
        .status(201)
        .json({
            'message' : 'Post created Successfully',
            'post' : savedPost
        })
    }catch(err){
        console.log(err.message)
        res
        .status(500)
        .send('Internal Server Error')
    }
})

app.post('/connect' , userAuthCheck , async (req , res) => {
    try{
        const { to_id } = req.body
        if (!to_id) return res.status(400).send(`Bad request`)
        const ourUser = req.user[0]
        const existingRequest = await Oppertunities.findOne({
            from_id: ourUser._id,
            to_id: to_id
        });
        if (existingRequest) {
            return res
            .status(400)
            .send('Connection request already sent');
        }
        const from_id = ourUser._id
        const newOppertunity = new Oppertunities({
            from_id , to_id
        })
        const AvailableOppertunity = await newOppertunity.save()
        return res
        .status(201)
        .json({
            'message' : 'Connection Request Sent' , 
            'YourConnection' : AvailableOppertunity
        })
    }catch(err){
        return res
        .status(500)
        .send(`Internal Server Error`)
    }

})

app.patch('/connect/accept' , userAuthCheck , async (req , res) => {
    try{
        const ourUser = req.user[0]
        const { _id } = req.body
        if (!_id) return res.status(400).send(`Bad request`)
        const ourOppertunity = await Oppertunities.find({
            from_id : _id , 
            to_id : ourUser._id
        })
        if (ourOppertunity.length === 0)return res.status(404).send(`Something Went Wrong`)
        const opper_id = ourOppertunity[0]._id
        const updateRequest = await Oppertunities.findByIdAndUpdate(opper_id , {
            connection_status : 'accepted'
        })
        ourUser.followers ++
        ourUser.followerlist = [...ourUser.followerlist , _id.toString()]
        await User.findByIdAndUpdate(ourUser._id , {
            followers : ourUser.followers,
            followerlist : ourUser.followerlist
        } , {
            new : true
        })
        return res
        .status(200)
        .json({
            'message' : 'Connection Request Accepted' , 
            'updatedRequest' : updateRequest
        })

    }catch(err){
        console.log(err.message)
        return res
        .status(500)
        .send(`Internal Server Error`)
    }
})

app.delete('/connect/reject' , userAuthCheck , async (req , res) => {
    try{
        const ourUser = req.user[0]
        const { _id } = req.body
        if (!_id) return res.status(400).send(`Bad Request`)
        const ourOppertunity = await Oppertunities.findOne({
            from_id : _id , 
            to_id : ourUser._id
        })
        if (!ourOppertunity) return res.status(404).send(`Something Went Wrong`)
        await ourOppertunity.deleteOne()
        return res
        .status(200)
        .send(`Request Rejected`)
    }catch(err){
        console.log(err.message)
        res.status(500).send(`Internal Server Error`)
    }
})

app.get('/connections' , userAuthCheck , async (req , res) => {
    try{
        const user_id = req.user[0]._id
        const requests = await Oppertunities.find({
            to_id : user_id , 
            connection_status : 'Pending'
        })
        if (requests.length == 0) return res.status(404).send(`No requests for you`)
        const requestIds = requests.map((request) => request.from_id.toString())
        const allUsers = await User.find({})
        const requiredUsers = allUsers.filter((user) => requestIds.includes(user._id.toString()))
        return res.status(200).json({
            'requestUsers' : requiredUsers
        })
    }catch(err){
        console.log(err.message)
        res.status(500).send(`Internal Server Error`)
    }
})
app.get('/get/myPost' , userAuthCheck , async (req , res) => {
    try{
        const ourUser_id = req.user[0]._id
        const userPosts = await Post.find({createdBy : ourUser_id})
        if (userPosts.length === 0) return res
        .status(404)
        .send(`No Posts Available`)
        return res
        .status(200)
        .json({
            'message' : 'Youre Posts' ,
            'posts' : userPosts
        })
    }catch(err){
        console.log(err.message)
        return res
        .status(500)
        .send(`Internal Server Error`)
    }
})

app.patch('/update/profile' , userAuthCheck , async (req , res) => {
    try{

    }catch(err){
        console.log(err.messgae)
        return res
        .status(500)
        .send(`Internal Server Error`)
    }
})

app.patch('/update/post',  upload.fields([{name : 'postImage' , maxCount : 1},
    {name : 'companyLogo' , maxCount : 1}
]),  async (req , res) => {
    try{
        const companyLogo_path = req.files?.companyLogo[0].path
        const postImage_path = req.files?.postImage[0].path
        const { tags } = req.body

    }catch(err){
        console.log(err.message)
        return res
        .status(500)
        .send(`Internal Server Error`)
    }
})

app.delete('/delete/post' , userAuthCheck ,  async (req , res) => {
    try{
        const post_id = req.query.post_id
        const userPost = await Post.findById(post_id)
        if (!userPost) return res.status(404).send(`Post Not Found`)
        await userPost.deleteOne()
        return res
        .status(200)
        .send(`Post Deleted Successfully`)
    }catch(err){
        console.log(err.message)
        return res
        .status(500)
        .send(`Internal Server Error`)
    }
})

app.get('/mypossibleConnections' , userAuthCheck ,  async (req , res) => {
    try{
        const ourUser = req.user[0]
        const requestsSentByourUser = await Oppertunities.find({from_id : ourUser._id})
        const requestforOurUser = await Oppertunities.find({to_id : ourUser._id})
        const requestSentIds = requestsSentByourUser.map((request) => request.to_id.toString())
        const getRequestIds = requestforOurUser.map((request) => request.from_id.toString())
        const allUsers = await User.find({})
        const pendingRequestUsers = allUsers.filter(
            (user) => !requestSentIds.includes(user._id.toString()) &&
             !getRequestIds.includes(user._id.toString()) &&
              user._id.toString() !== ourUser._id.toString()
        )
        return res
        .status(200)
        .json({
            'message' : 'possible connections' , 
            'possibleConnections' : pendingRequestUsers
        })
    }catch(err){
        console.log(err.message)
        return res
        .status(500)
        .send(`Internal Server Error`)
    }
})

app.get('' , async (req , res) => {
    const token = req.query.token;
    const ourUser = jwt.verify(token , process.env.JWT_SECRET)
    try{
        const client = await User.find({_id : ourUser._id})
        return res
        .status(200)
        .json({
            'message' : 'user exists',
            'user_data' : client
        })
    }catch(err){
        console.log(err.message)
        res
        .status(400)
        .send('Bad Request')
    }
})

connectDB()
    .then(() => {
        app.listen(process.env.local_port , () => {
            console.log('Server is running successfully');
        })
    }).catch((err) => {
        console.log('connect Failed:', err.message);
    })