import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import mainCategoryRoutes from './routes/mainCategoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customCakeRoutes from './routes/customCakeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import SiteConfig from './models/SiteConfig.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { connectDatabase } from './config/db.js';

const app=express();
const allowedOrigins=new Set([...String(process.env.CLIENT_URL||'').split(',').map(origin=>origin.trim()).filter(Boolean),'http://localhost:5173','http://localhost:5174']);
app.use(cors({
  origin:(origin,callback)=>callback(null,!origin||allowedOrigins.has(origin)),
  credentials:true,
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(async(req,res,next)=>{try{await connectDatabase();next()}catch(error){next(error)}});
app.use('/uploads',express.static('uploads'));
app.get('/api/health',(req,res)=>res.json({status:'ok',service:'My New Bakery API'}));
app.get('/api/site-config',async(req,res,next)=>{try{res.set('Cache-Control','no-store');res.json({config:await SiteConfig.findOneAndUpdate({key:'main'},{},{upsert:true,returnDocument:'after',setDefaultsOnInsert:true})})}catch(error){next(error)}});
app.use('/api/auth',authRoutes);
app.use('/api/products',productRoutes);
app.use('/api/categories',categoryRoutes);
app.use('/api/main-categories',mainCategoryRoutes);
app.use('/api/cart',cartRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api/custom-cakes',customCakeRoutes);
app.use('/api/reviews',reviewRoutes);
app.use('/api/contact-messages',contactRoutes);
app.use('/api/admin',adminRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
