import mongoose from 'mongoose';

const stockMovementSchema=new mongoose.Schema({
  product:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true,index:true},
  type:{type:String,enum:['restock','manual_removal','sale'],required:true},
  quantity:{type:Number,required:true,min:0},
  stockBefore:{type:Number,required:true,min:0},
  stockAfter:{type:Number,required:true,min:0},
  order:{type:mongoose.Schema.Types.ObjectId,ref:'Order'},
  note:String,
},{timestamps:true});

export default mongoose.model('StockMovement',stockMovementSchema);
