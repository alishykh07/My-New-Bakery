import mongoose from 'mongoose';

export default mongoose.model('ContactMessage',new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:100},
  email:{type:String,required:true,trim:true,lowercase:true,maxlength:160},
  phone:{type:String,trim:true,maxlength:40},
  subject:{type:String,required:true,trim:true,maxlength:180},
  message:{type:String,required:true,trim:true,maxlength:3000},
  status:{type:String,enum:['new','read','replied'],default:'new'},
  notificationSeenAt:Date
},{timestamps:true}));
