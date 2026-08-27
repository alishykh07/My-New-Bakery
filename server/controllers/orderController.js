import Order from '../models/Order.js';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';
import SiteConfig from '../models/SiteConfig.js';
import { generateOrderId } from '../utils/generateOrderId.js';
import { sendOrderConfirmation } from '../utils/sendEmail.js';
export async function createOrder(req,res,next){try{const {items=[],address,phone,paymentMethod,deliveryDate}=req.body;if(!items.length)return res.status(400).json({message:'Your bag is empty'});const products=await Product.find({_id:{$in:items.map(item=>item.product)},isActive:true,archived:{$ne:true}});const byId=new Map(products.map(product=>[String(product._id),product]));const safeItems=items.map(item=>{const product=byId.get(String(item.product));if(!product)throw new Error('One of the selected products is no longer available');const variant=product.variants?.find(option=>option.label===item.size);const price=variant?variant.price:product.price;return{product:product._id,name:product.name,image:product.images?.[0],price,quantity:Math.max(1,Number(item.quantity)||1),size:item.size||variant?.label||product.sizes?.[0]||'',flavor:item.flavor||''}});const config=await SiteConfig.findOne({key:'main'}).lean();const pickupRequested=req.body.fulfillmentType==='pickup';if(pickupRequested&&config?.pickupAvailable===false)return res.status(400).json({message:'Bakery pickup is currently unavailable'});const fulfillmentType=pickupRequested?'pickup':'delivery';const orderSubtotal=safeItems.reduce((sum,item)=>sum+item.price*item.quantity,0);const threshold=Math.max(0,Number(config?.freeDeliveryThreshold)||0);const configuredFee=Math.max(0,Number(config?.deliveryFee)||0);const deliveryFee=fulfillmentType==='pickup'||(threshold>0&&orderSubtotal>=threshold)?0:configuredFee;const isUrgent=fulfillmentType==='delivery'&&req.body.isUrgent===true;const urgentFee=isUrgent?100:0;const total=orderSubtotal+deliveryFee+urgentFee;const order=await Order.create({orderNumber:generateOrderId(),customer:req.user._id,items:safeItems,subtotal:orderSubtotal,fulfillmentType,deliveryFee,isUrgent,urgentFee,total,address:fulfillmentType==='pickup'?{}:address,phone,paymentMethod,deliveryDate});let emailSent=false;try{emailSent=await sendOrderConfirmation({to:req.user.email,customerName:req.user.name,customerEmail:req.user.email,order,bakery:config||{}});if(!emailSent)console.error(`Order confirmation email skipped for ${order.orderNumber}: SMTP settings or customer email missing`)}catch(error){console.error(`Order confirmation email failed for ${order.orderNumber}:`,error.message)}res.status(201).json({order,emailSent})}catch(e){next(e)}}
export async function listOrders(req,res,next){try{const filter=req.user.role==='admin'?{}:{customer:req.user._id};res.json({orders:await Order.find(filter).populate('customer','name email').populate('items.product','name images').sort('-createdAt')})}catch(e){next(e)}}
export async function getOrder(req,res,next){try{const filter={_id:req.params.id,...(req.user.role==='admin'?{}:{customer:req.user._id})};const order=await Order.findOne(filter).populate('customer','name email phone address').populate('items.product','name images');if(!order)return res.status(404).json({message:'Order not found'});res.json({order})}catch(e){next(e)}}
export async function updateOrder(req,res,next){
  try {
    const allowed=['orderStatus','paymentStatus','deliveryDate'];
    const update=Object.fromEntries(Object.entries(req.body).filter(([key])=>allowed.includes(key)));
    const existing=await Order.findById(req.params.id);
    if(!existing)return res.status(404).json({message:'Order not found'});

    if(update.orderStatus==='delivered'&&!existing.stockDeductedAt){
      const quantities=new Map();
      for(const item of existing.items){
        if(!item.product)continue;
        const id=String(item.product);
        quantities.set(id,(quantities.get(id)||0)+Math.max(0,Number(item.quantity)||0));
      }
      for(const [productId,quantity] of quantities){
        const product=await Product.findById(productId);
        if(!product)continue;
        const before=product.stock;
        product.stock=Math.max(0,product.stock-quantity);
        product.sold=(product.sold||0)+quantity;
        await product.save();
        await StockMovement.create({product:product._id,type:'sale',quantity,stockBefore:before,stockAfter:product.stock,order:existing._id,note:existing.orderNumber});
      }
      update.stockDeductedAt=new Date();
    }

    const order=await Order.findByIdAndUpdate(req.params.id,update,{returnDocument:'after',runValidators:true}).populate('customer','name email phone address').populate('items.product','name images');
    res.json({order});
  }catch(e){next(e)}
}
