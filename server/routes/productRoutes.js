import { Router } from 'express';
import multer from 'multer';
import { adjustStock,createProduct,deleteProduct,getProduct,listProducts,listStockMovements,updateProduct,uploadProductImage } from '../controllers/productController.js';
import { adminOnly,protect } from '../middleware/authMiddleware.js';

const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>cb(null,file.mimetype.startsWith('image/'))});
const router=Router();
router.get('/',(req,res,next)=>{const token=req.headers.authorization?.replace('Bearer ','');if(!token)return listProducts(req,res,next);protect(req,res,()=>listProducts(req,res,next))});
router.post('/upload-image',protect,adminOnly,upload.single('image'),uploadProductImage);
router.get('/inventory-history',protect,adminOnly,listStockMovements);
router.get('/:slug',getProduct);
router.post('/',protect,adminOnly,createProduct);
router.patch('/:id',protect,adminOnly,updateProduct);
router.delete('/:id',protect,adminOnly,deleteProduct);
router.patch('/:id/stock',protect,adminOnly,adjustStock);
export default router;
