import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { connectDatabase } from './config/db.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';
dotenv.config({path:fileURLToPath(new URL('../.env',import.meta.url))});
const items=[
 ['Birthday Cakes','cakes'],['Chocolate Cakes','cakes'],['Wedding Cakes','cakes'],['Anniversary Cakes','cakes'],['Kids Cakes','cakes'],['Theme Cakes','cakes'],['Customized Cakes','cakes'],['Other Cakes','cakes'],
 ['Chicken Paties','paties'],['Potato Paties','paties'],['Vegetable Paties','paties'],['Cheese Paties','paties'],['Mixed Paties','paties'],['Special Paties','paties'],['Other Paties','paties']
];
const products=[
 ['midnight-chocolate-cake','Midnight Chocolate Cake','cakes','Chocolate Cakes',3490,'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=85',['1 Pound','2 Pound','3 Pound'],true,true],
 ['berry-bloom-cake','Berry Bloom Cake','cakes','Birthday Cakes',3890,'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=1200&q=85',['1 Pound','2 Pound'],true,false],
 ['golden-vanilla-cake','Golden Vanilla Cake','cakes','Anniversary Cakes',2990,'https://images.unsplash.com/photo-1559622214-f8a9850965bb?auto=format&fit=crop&w=1200&q=85',['1 Pound','2 Pound','3 Pound'],true,false],
 ['celebration-confetti-cake','Celebration Confetti Cake','cakes','Kids Cakes',3690,'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=1200&q=85',['1 Pound','2 Pound'],true,false],
 ['chicken-paties','Golden Chicken Paties','paties','Chicken Paties',1650,'https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=1200&q=85',['Pack of 6','Pack of 12'],false,true],
 ['potato-paties','Herbed Potato Paties','paties','Potato Paties',1250,'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=1200&q=85',['Pack of 6','Pack of 12'],false,false],
 ['vegetable-paties','Garden Vegetable Paties','paties','Vegetable Paties',1350,'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85',['Pack of 6','Pack of 12'],false,false]
];
await connectDatabase();
const categories={};for(const [name,type] of items){categories[name]=await Category.findOneAndUpdate({slug:name.toLowerCase().replaceAll(' ','-')},{name,type,slug:name.toLowerCase().replaceAll(' ','-')},{upsert:true,returnDocument:'after',setDefaultsOnInsert:true})}
for(const [slug,name,type,category,price,image,sizes,featured,bestSeller] of products){await Product.findOneAndUpdate({slug},{name,slug,type,category:categories[category]._id,price,images:[image],sizes,flavors:['Vanilla','Chocolate'],stock:30,featured,bestSeller,isActive:true,description:`Freshly baked ${name} by My New Bakery.`},{upsert:true,returnDocument:'after',setDefaultsOnInsert:true})}
const password=await bcrypt.hash(process.env.ADMIN_PASSWORD||'Admin@12345',12);await User.findOneAndUpdate({email:process.env.ADMIN_EMAIL||'admin@mynewbakery.pk'},{name:'My New Bakery Admin',email:process.env.ADMIN_EMAIL||'admin@mynewbakery.pk',password,role:'admin'},{upsert:true,returnDocument:'after',setDefaultsOnInsert:true});
console.log('Database seeded. Admin: admin@mynewbakery.pk / Admin@12345 (change it after first login)');process.exit(0);
