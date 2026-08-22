import { Router } from 'express';
import ContactMessage from '../models/ContactMessage.js';

const router=Router();
router.post('/',async(req,res,next)=>{try{const {name,email,phone,subject,message}=req.body;if(!name||!email||!subject||!message)return res.status(400).json({message:'Name, email, subject and message are required'});await ContactMessage.create({name,email,phone,subject,message});res.status(201).json({message:'Thank you! Your message has been sent to My New Bakery.'})}catch(error){next(error)}});
export default router;
