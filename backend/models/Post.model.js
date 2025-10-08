import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 150,
    },
    
    content: {
        type: String,
        required: true,
        minlength: 20,
    },
    
    tags: {
        type: [String], 
        default: [],
    },
    claps: { 
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },
    imageUrl: {
        type: String,
        default: null,
    },
    imagePublicId: { type: String },
    excerpt: {
        type: String,
    },
    

}, { timestamps: true });

export default mongoose.model("Post", postSchema);