import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({ name:{type:String,required:true,trim:true}, email:{type:String,required:true,unique:true,lowercase:true,trim:true}, password:{type:String,required:true,minlength:8,select:false}, passwordResetCodeHash:{type:String,select:false},passwordResetExpires:{type:Date,select:false}, phone:String, address:{line1:String,city:String,area:String}, role:{type:String,enum:['customer','admin'],default:'customer'},isActive:{type:Boolean,default:true},isVip:{type:Boolean,default:false},notes:String },{timestamps:true});
userSchema.pre('save',async function(){if(this.isModified('password')) this.password=await bcrypt.hash(this.password,12)});
userSchema.methods.comparePassword=function(password){return bcrypt.compare(password,this.password)};
export default mongoose.model('User',userSchema);
