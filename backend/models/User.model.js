import mongoose  from "mongoose";
const userSchema=mongoose.Schema({
    name:String,
    email:String,
    password:String,name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, 
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false,  
    },

    /* posts:[
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref:'post'   -> no need of posts array because using read this for better understanding
    //     }
    // ]
    
    That's an insightful question about database efficiency. This is a very common point of confusion when structuring MongoDB applications!

    * I will explain the difference using the analogy of a School Library Card versus a Library's Book Catalog.

    * The School Library Analogy
    Imagine you are looking for all the books written by one author (Nava).

    * 1. The Efficient Way (Querying the Post Model)
    This is the method where you DO NOT need the posts array in the User Model.

    * The Post Model (Post.model.js): This is like the Library's Book Catalog. Every book card has one required field: "Author: Nava (ID: 123)".

    * How to Find Posts: When you want all of Nava's books, you ask the system: "Show me every single card in the entire catalog where the 'Author' field says 'Nava (ID: 123)'."

    * Mongoose Code: Post.find({ author: navasId })

    * Result: The system efficiently scans the Post collection and returns all of Nava's posts.
    */
    
}, { timestamps: true })
export default mongoose.model("User", userSchema);
