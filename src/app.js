const express = require('express');
const connectDB = require('./DataBase/dbConfig')
const app = express();
const cors = require('cors');
const authRouter = require('./auth/auth')
const Post = require('./models/Posts');
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true
}))
app.use('/auth', authRouter);

app.get ('/feed' , async (req , res) => {
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
connectDB()
    .then(() => {
        app.listen(5000 , () => {
            console.log('Server is running on port 5000');
        })
    }).catch((err) => {
        console.log('connect Failed:', err);
    })