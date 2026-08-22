<div align="center">
  <img src="client/public/images/logo/logo.jfif" alt="My New Bakery logo" width="110" />

  # My New Bakery

  ### Freshly baked for every celebration

  A full-stack bakery platform for browsing products, placing orders, requesting custom cakes, and managing the complete bakery operation from one dashboard.
</div>

![My New Bakery hero](client/public/images/cakes/wedding-hero.png)

## What’s inside

| Customer storefront | Admin dashboard | Backend API |
| --- | --- | --- |
| Browse cakes, cookies, donuts, pastries and more | Manage categories, products, orders, stock, payments and reviews | Express + MongoDB API with authentication, uploads and email |
| Cart, checkout, delivery/pickup and order history | Home/category visibility controls and business settings | Cloudinary images, Gmail SMTP order confirmations and JWT roles |
| Custom cake requests with reference images | Quotes and custom-order management | Secure customer/admin endpoints |

## Project structure

```text
My-New-Bakery/
├── client/      # Customer storefront (React + Vite)
├── admin/       # Bakery management dashboard (React + Vite)
├── server/      # API, database models and email service (Express + MongoDB)
├── package.json # Workspace commands
└── README.md
```

## Technology

- React, Vite and Tailwind CSS
- Express and MongoDB / Mongoose
- JWT authentication with customer and admin roles
- Cloudinary for image uploads
- Nodemailer + Gmail SMTP for transactional emails
- GSAP, Three.js and Lucide icons

## Local setup

1. Install dependencies from the project root:

   ```bash
   npm install
   ```

2. Configure the three environment files:

   ```text
   client/.env
   admin/.env
   server/.env
   ```

3. Start all applications in development mode:

   ```bash
   npm run dev
   ```

| App | Local URL |
| --- | --- |
| Customer website | `http://localhost:5173` |
| Admin dashboard | `http://localhost:5174` |
| API | `http://localhost:5000/api` |

## Environment variables

### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### `admin/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### `server/.env`

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/my-new-bakery
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173,http://localhost:5174

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-gmail-app-password
SMTP_FROM="My New Bakery <your-email@gmail.com>"
```

> Never commit real secrets. Use the matching `.env.example` files as safe templates.

## Commands

```bash
# Customer site + admin + API together
npm run dev

# API only (production-style start)
npm start

# Customer site only
npm run client

# Admin dashboard only
npm run admin

# Create production builds for client and admin
npm run build

# Seed initial data
npm run seed --workspace server
```

## Core features

- Category, subcategory and product management
- Per-size / per-quantity product prices
- Cart, checkout, delivery fee and pickup support
- Customer order history with item images and full billing details
- Custom cake request, quote and confirmation flow
- Customer order-confirmation emails with delivery schedule and totals
- Inventory tracking and low-stock monitoring
- Reviews, inquiries, notifications and payments management
- Dashboard controls for Category Bar and Home Favourite visibility

## Deployment checklist

1. Deploy the API and set every secret in `server/.env` on the hosting provider.
2. Set `VITE_API_URL` in both client and admin to the public API URL, for example:

   ```env
   VITE_API_URL=https://api.yourdomain.com/api
   ```

3. Add both deployed frontend URLs to `server/.env`:

   ```env
   CLIENT_URL=https://yourdomain.com,https://admin.yourdomain.com
   ```

4. Rebuild client and admin after changing `VITE_API_URL`.
5. Verify Cloudinary uploads, MongoDB access and Gmail SMTP before launch.

---

<div align="center">
  Made with care for <strong>My New Bakery</strong> 🧁
</div>
