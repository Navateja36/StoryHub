import express from 'express'
import postModel from '../models/Post.model.js'
import Post from "../models/Post.model.js";
import userModel from '../models/User.model.js';
import verifyToken from '../middleware/auth.middleware.js'
import upload from '../middleware/cloudinaryUpload.middleware.js'; // Multer Configuration

const router=express.Router();

// ------------------------------------------------------------------------
// ROUTE 1: POST /api/posts/create (Protected, Handles File Upload)
// ------------------------------------------------------------------------

router.post('/create', verifyToken, (req, res, next) => {
    // 1. Multer processes the file and text fields
    upload.single('postImage')(req, res, async (err) => {
        
        // --- 2. FILE UPLOAD ERROR HANDLING (Multer errors are handled first) ---
        if (err) {
            console.error("Multer Error:", err);
            if (err.message && err.message.includes('File upload rejected')) {
                return res.status(400).send({ message: err.message });
            }
            if (err.code === 'LIMIT_FILE_SIZE') {
                 return res.status(400).send({ message: "File too large (Max 5MB)." });
            }
            return res.status(500).send({ message: "File processing failed." });
        }
        
        // --- 3. PROCEED TO CONTROLLER LOGIC (Data is now in req.body and req.file) ---
        
        // Multer populates req.body with plain strings from FormData
        const {title,content,tags}=req.body; 
        const authorId = req.userId;
        // const filePath = req.file ? '/uploads/' + req.file.filename : null; 
        const imageUrl = req.file ? req.file.path : null;

        if(!title || !content){
            return res.status(400).send({message:"Title and content are required."});
        }
        
        try{
            const newPost=await postModel.create({
                author:authorId,
                title,
                content,
                tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
                imageUrl: imageUrl, 
                excerpt: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
            });
            
            return res.status(201).send({message:"Post created and published successfully", posts: newPost})
            
        } catch(error){
            // FIX: Check for Mongoose Validation Error (ValidationError)
            if (error.name === 'ValidationError') {
                // Extract the first error message for a cleaner response
                const firstError = Object.values(error.errors)[0].message;
                return res.status(400).send({ message: `Validation Error: ${firstError}` });
            }
            console.error("Database Save Error:", error);
            return res.status(500).send({ message: "Server error during post creation." });
        }
    });
});

// ------------------------------------------------------------------------
// ROUTE 2: GET /api/posts/feed (PUBLIC)
// ------------------------------------------------------------------------
router.get('/feed',async (req,res)=>{
    try{
        const posts=await postModel.find({}).sort({createdAt:-1}).populate('author','name email');
        res.status(200).send({posts:posts});
    }catch(error){
        res.status(500).send({ message: "Error fetching post feed." });
    }
})

// ------------------------------------------------------------------------
// ROUTE 3: GET /api/posts/:postId (PUBLIC)
// ------------------------------------------------------------------------
router.get('/:postId',async (req,res)=>{
    try{
        const postId=req.params.postId;
        const post=await postModel.findById(postId).populate('author','name email');
        if(!post){
            return res.status(404).send({message:"post not found"})
        }
        res.status(200).send({posts:post});
    }
    catch(error){
        if (error.kind === 'ObjectId') {
            return res.status(404).send({ message: "Invalid Post ID format." });
       }
       res.status(500).send({ message: "Error fetching post details." });
    }
})

router.get('/userPosts/:userId',verifyToken,async(req,res)=>{
try{
    
     const userId=req.params.userId;
    
     const posts=await postModel.find({author:userId}).populate('author','name email')
    
     res.status(200).send({posts:posts})
    }
    catch(error){
    
     res.status(500).send({message:"error fetching posts of user"})
    }
    
    })

// ------------------------------------------------------------------------
// ROUTE 4: DELETE /api/posts/:postId (PROTECTED)
// ------------------------------------------------------------------------
router.delete('/:postId',verifyToken,async (req,res)=>{
    try{
        const postId=req.params.postId;
        const userId=req.userId;

        const post =await postModel.findById(postId);

        if(!post){
            return res.status(404).send({message:"post not found"});
        }

        if(post.author.toString()!==userId){
            return res.status(403).send({message:"your not author of this post"})
        }
        await postModel.deleteOne({_id:postId});
        res.status(200).send({ message: "Post deleted successfully." });
    }
    catch (error) {
        if (error.kind === 'ObjectId') {
             return res.status(400).send({ message: "Invalid Post ID format." });
        }
        res.status(500).send({ message: "Server error during post deletion." });
    }
})

// ------------------------------------------------------------------------
// ROUTE 5: PUT /api/posts/:postId (PROTECTED)
// ------------------------------------------------------------------------
router.put('/:postId',verifyToken,async (req,res)=>{
    try{
        const postId=req.params.postId;
        const userId=req.userId;
        const updates=req.body;

        const post=await postModel.findById(postId);
        if(!post){
            return res.status(404).send({message:"post not found"})
        }

        // FIX: Using strict inequality (!==) for security
        if(post.author.toString()!==userId){
            return res.status(403).send({message:"your not author of this post"})
        }
        const updatedPost=await postModel.findByIdAndUpdate(postId,{
            // $set ensures only the fields provided in the body are updated
            $set:updates,
            excerpt: updates.content ? updates.content.substring(0, 150) + (updates.content.length > 150 ? '...' : '') : post.excerpt
        },
        { new: true, runValidators: true } ).populate('author','name email');


        res.status(200).send({ 
            message: "Post updated successfully.", 
            posts: updatedPost 
        });
    }catch(error){
        if (error.kind === 'ObjectId' || error.name === 'ValidationError') {
            return res.status(400).send({ message: "Invalid ID or missing required data." });
        }
        res.status(500).send({ message: "Server error during post update." });
    }
})

router.put("/clap/:id", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.userId; 

        if (!post) return res.status(404).json({ message: "Post not found" });
        if (!Array.isArray(post.claps)) post.claps = [];

        const hasClapped = post.claps.map(id => id.toString()).includes(userId.toString());

        if (hasClapped) {
            post.claps = post.claps.filter(id => id.toString() !== userId.toString());
        } else {
            post.claps.push(userId);
        }

        await post.save();
        const updatedPost = await Post.findById(post._id).populate("author", "name email");


        res.json({ posts: updatedPost });
    } catch (error) {
        console.error("Clap Toggle Error:", error);
        res.status(500).json({ message: "Failed to toggle clap" });
    }
});



export default router;
