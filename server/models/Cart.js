import mongoose from 'mongoose';
export default mongoose.model('Cart',new mongoose.Schema({customer:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,unique:true},items:[{product:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true},quantity:{type:Number,default:1,min:1},size:String,flavor:String}]},{timestamps:true}));
