    import express from 'express'
    import userModel from '../models/User.model.js';
    import bcrypt from 'bcrypt';
    import jwt from 'jsonwebtoken';
    const router=express.Router();


    router.post('/register',async (req,res)=>{
        const {name,email,password}=req.body;
        if(!name || !email || !password){
            return res.status(400).send({message:"missing required fields"})
        }
        try{
            const salt=await bcrypt.genSalt(10);
            const hashpassword=await bcrypt.hash(password,salt);
            const newUser=await userModel.create({
                name,
                email,
                password:hashpassword
            })
            let token=jwt.sign({id: newUser._id,email:newUser.email},process.env.JWT_SECRET,{ expiresIn: '1d' });
            newUser.password = undefined; 
            res.status(201).send({message:"user created successfuly",token:token,user:newUser})
        }catch(error){
            if (error.code === 11000) {
                return res.status(409).send({ message: "Email already exists. Please login." });
            }
            res.status(500).send({ message: "Internal server error during registration." });
        }
    })

    router.post('/login',async (req,res)=>{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).send({message:"email and password required"})
        }
        try{
            const user=await userModel.findOne({email}).select('+password');
            // console.log(user);
            if(!user){
                return res.status(401).send({message:"invalid credentials"})
            }
            const isMatch=await bcrypt.compare(password,user.password)
            if (!isMatch) {
                return res.status(401).send({ message: "Invalid credentials." });
            }
            const token=jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET,{ expiresIn: '1d' });
            user.password = undefined;
            res.status(200).send({ 
                message: "Login successful!",
                token: token, 
                user: user 
            });

        }catch(error){
            console.error(error);
            res.status(500).send({ message: "Internal server error during login." });
        }
    })

router.post('/logout', (req, res) => {
        // The server just sends the signal; the frontend deletes the token.
            res.status(200).send({ message: "Logged out successfully. Token deleted by client." });
    });
    

    export default router;