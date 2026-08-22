import { Router } from 'express';
import multer from 'multer';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { uploadImage } from '../config/cloudinary.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')) });
const safePart = value => String(value || 'other').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'other';
const productType = department => ['pastries', 'savory'].includes(department) ? 'paties' : 'cakes';

router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().sort('order department name').lean();
    const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const countMap = new Map(counts.map(item => [String(item._id), item.count]));
    res.json({ categories: categories.map(category => ({ ...category, productCount: countMap.get(String(category._id)) || 0 })) });
  } catch (error) { next(error); }
});

router.post('/upload-image', protect, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please choose a category image' });
    const uploaded = await uploadImage(req.file.buffer, `my-new-bakery/categories/${safePart(req.body.department)}`);
    res.status(201).json({ image: uploaded.secure_url, publicId: uploaded.public_id });
  } catch (error) { next(error); }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const department = req.body.department || 'cakes';
    res.status(201).json({ category: await Category.create({ ...req.body, department, type: productType(department) }) });
  } catch (error) { next(error); }
});

router.patch('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.department) body.type = productType(body.department);
    const category = await Category.findByIdAndUpdate(req.params.id, body, { returnDocument: 'after', runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ category });
  } catch (error) { next(error); }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount) return res.status(409).json({ message: `This category has ${productCount} product(s). Move them before deleting it.` });
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) { next(error); }
});

export default router;
