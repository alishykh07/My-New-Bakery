import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { StoreProvider } from './context/StoreContext.jsx';
import SiteLayout from './components/Layout/SiteLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import CakesPage from './pages/CakesPage.jsx';
import PatiesPage from './pages/PatiesPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import CustomCakePage from './pages/CustomCakePage.jsx';
import CustomCakeRequestsPage from './pages/CustomCakeRequestsPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import StaticPage from './pages/StaticPage.jsx';
import OrderSuccessPage from './pages/OrderSuccessPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ReviewPage from './pages/ReviewPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import { useSiteConfig } from './services/siteConfig.js';
import InitialLoader from './components/UI/InitialLoader.jsx';

const ContactPage=lazy(()=>import('./pages/ContactPage.jsx'));

function AboutContent(){const config=useSiteConfig();return <StaticPage title="Our story">{config.aboutText||'We bake thoughtful cakes and paties for the moments you will remember.'}</StaticPage>}
function ContactContent(){const config=useSiteConfig();return <StaticPage title="Let’s make something beautiful.">{config.contactText||`Email ${config.email} or call ${config.phone} for cake consultations and bulk orders.`}</StaticPage>}

export default function App() {
  return <StoreProvider><InitialLoader/><SiteLayout><Routes>
    <Route path="/" element={<HomePage/>}/><Route path="/cakes" element={<CakesPage/>}/><Route path="/paties" element={<PatiesPage/>}/><Route path="/search" element={<SearchPage/>}/><Route path="/products/:slug" element={<ProductPage/>}/><Route path="/review" element={<ReviewPage/>}/><Route path="/cart" element={<CartPage/>}/><Route path="/checkout" element={<CheckoutPage/>}/><Route path="/order-success/:id" element={<OrderSuccessPage/>}/><Route path="/custom-cake" element={<CustomCakePage/>}/><Route path="/custom-cake-requests" element={<CustomCakeRequestsPage/>}/><Route path="/login" element={<AuthPage/>}/><Route path="/register" element={<AuthPage register/>}/><Route path="/orders" element={<OrdersPage/>}/><Route path="/profile" element={<ProfilePage/>}/>
    <Route path="/about" element={<AboutPage/>}/><Route path="/contact" element={<Suspense fallback={<StaticPage title="Contact us">Loading contact page...</StaticPage>}><ContactPage/></Suspense>}/><Route path="*" element={<StaticPage title="Page not found">The page you are looking for does not exist.</StaticPage>}/>
  </Routes></SiteLayout></StoreProvider>;
}
