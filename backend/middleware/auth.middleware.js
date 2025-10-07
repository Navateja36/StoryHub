import jwt from 'jsonwebtoken';
// import { useNavigate } from 'react-router-dom'; 

const verifytoken=(req,res,next)=>{
    // const navigate=useNavigate();
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ message: "Access denied. Token missing or invalid format." });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; 
        next();
    } catch (error) {
        return res.status(401).send({ message: "Invalid token. Authorization failed." });
        // navigate('/login')
    }
}
export default verifytoken;
