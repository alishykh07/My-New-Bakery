import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function protect(req,res,next){try{const token=req.headers.authorization?.replace('Bearer ','');if(!token)return res.status(401).json({message:'Authentication required'});const decoded=jwt.verify(token,process.env.JWT_SECRET);req.user=await User.findById(decoded.id);if(!req.user)return res.status(401).json({message:'User not found'});if(req.user.isActive===false)return res.status(401).json({code:'ACCOUNT_INACTIVE',message:'Your account has been deactivated by the bakery.'});next()}catch{res.status(401).json({message:'Invalid or expired token'})}}
export const adminOnly=(req,res,next)=>req.user?.role==='admin'?next():res.status(403).json({message:'Admin access required'});
