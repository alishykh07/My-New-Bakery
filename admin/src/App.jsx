import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Bell,
  CakeSlice,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  Config,
  Customers,
  Dashboard,
  Inventory,
  Payments,
  Reviews,
} from "./AdminModules.jsx";
import Categories from "./modules/categories/CategoryManager.jsx";
import ProductOps from "./modules/products/ProductOps.jsx";
import OrdersAdmin from "./modules/orders/OrdersAdmin.jsx";
import NotificationsPage from "./modules/orders/NotificationsPage.jsx";
import InquiriesManager from "./modules/inquiries/InquiriesManager.jsx";
import CustomRequestsPanel from "./modules/orders/CustomRequestsPanel.jsx";
import "./admin-modules.css";

const API = `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "").replace(/\/$/, "")}/api`;
const money = (value) => `Rs. ${(value || 0).toLocaleString()}`;
const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function request(path, options = {}, token) {
  let response;
  const fetchRequest = () => fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  try {
    response = await fetchRequest();
  } catch {
    await new Promise(resolve => window.setTimeout(resolve, 450));
    try { response = await fetchRequest(); }
    catch { throw new Error("API server is temporarily unreachable. Your login is محفوظ."); }
  }
  const data = await response.json().catch(() => ({}));
  if (response.status === 401 && token && !path.startsWith("/auth/")) {
    if (data.code === "ACCOUNT_INACTIVE") {
      localStorage.removeItem("mnb_admin_token");
      window.location.reload();
      throw new Error(data.message || "Admin account is inactive.");
    }
    throw new Error(`${data.message || "Request was not authorized"}. Your login has been kept.`);
  }
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function Login({ onLogin }) {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  async function submit(event) {
    event.preventDefault();
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(
          Object.fromEntries(new FormData(event.currentTarget)),
        ),
      });
      if (data.user.role !== "admin")
        throw new Error("This account does not have admin access");
      localStorage.setItem("mnb_admin_token", data.token);
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    }
  }
  async function sendResetCode() {
    setError("");
    try {
      const data = await request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email: resetEmail }) });
      setError(data.message);
    } catch (err) { setError(err.message); }
  }
  async function resetAdminPassword(event) {
    event.preventDefault();
    setError("");
    try {
      const data = await request("/auth/reset-password", { method: "POST", body: JSON.stringify({ email: resetEmail, code: resetCode, newPassword }) });
      setForgotMode(false); setNewPassword(""); setResetCode(""); setError(data.message);
    } catch (err) { setError(err.message); }
  }
  if (forgotMode) return (
    <main className="admin-login">
      <form className="forgot-form" onSubmit={resetAdminPassword}>
        <div className="login-logo">MNB</div>
        <p>MY NEW BAKERY</p>
        <h1>Forgot password.</h1>
        <span>Enter your admin email to receive a reset code.</span>
        <label>Email<div className="reset-email-row"><input type="email" value={resetEmail} onChange={event=>setResetEmail(event.target.value)} placeholder="Enter account email" required/><button type="button" onClick={sendResetCode}>Send</button></div></label>
        <label>Reset Code<input value={resetCode} onChange={event=>setResetCode(event.target.value)} inputMode="numeric" placeholder="Enter password reset code" required/></label>
        <label>New Password<div className="login-password-field"><input type={showPassword?"text":"password"} value={newPassword} onChange={event=>setNewPassword(event.target.value)} placeholder="Enter new password" minLength={8} required/><button type="button" className="login-password-eye" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
        <button type="submit">Reset Password</button>
        <button type="button" className="back-to-login" onClick={()=>{setForgotMode(false);setError("")}}>Back to Login</button>
        <small>{error}</small>
      </form>
    </main>
  );
  return (
    <main className="admin-login">
      <form onSubmit={submit}>
        <div className="login-logo">MNB</div>
        <p>MY NEW BAKERY</p>
        <h1>Welcome back.</h1>
        <span>Sign in to manage your bakery.</span>
        <label className="login-id-label">Username or Account Email<input name="identifier" type="text" placeholder="Enter username or account email" autoComplete="username" required/></label>
        <div className="login-label-row"><label htmlFor="admin-password">Password</label><button type="button" className="forgot-password" onClick={() => { setForgotMode(true); setError(""); }}>Forgot password?</button></div>
        <div className="login-password-field">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
          />
          <button type="button" className="login-password-eye" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button>
          Login to dashboard <ChevronRight size={17} />
        </button>
        <small>{error || "Use your admin account to continue."}</small>
      </form>
    </main>
  );
}

function ProductForm({ categories, token, onCreated, onCancel }) {
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get("name");
    const category = categories.find(
      (item) => item._id === form.get("category"),
    );
    try {
      const payload = {
        name,
        slug: slugify(name),
        category: category._id,
        type: category.type,
        description: form.get("description"),
        images: [form.get("image")].filter(Boolean),
        price: Number(form.get("price")),
        stock: Number(form.get("stock")),
        sizes: form
          .get("sizes")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        flavors: form
          .get("flavors")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        featured: form.get("featured") === "on",
        bestSeller: form.get("bestSeller") === "on",
        isActive: true,
      };
      await request(
        "/products",
        { method: "POST", body: JSON.stringify(payload) },
        token,
      );
      setMessage("Product published successfully.");
      event.currentTarget.reset();
      onCreated();
    } catch (err) {
      setMessage(err.message);
    }
  }
  return (
    <section className="product-form-wrap">
      <div className="section-title">
        <div>
          <p>CATALOG MANAGEMENT</p>
          <h2>Add a new product</h2>
        </div>
        <button className="text-button" onClick={onCancel}>
          Close
        </button>
      </div>
      <form className="product-form" onSubmit={submit}>
        <label>
          Product name
          <input
            required
            name="name"
            placeholder="e.g. Strawberry Celebration Cake"
          />
        </label>
        <label>
          Category
          <select required name="category" defaultValue="">
            <option value="" disabled>
              Select category
            </option>
            {categories.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Price (PKR)
          <input
            required
            min="0"
            name="price"
            type="number"
            placeholder="3490"
          />
        </label>
        <label>
          Stock quantity
          <input
            required
            min="0"
            name="stock"
            type="number"
            defaultValue="10"
          />
        </label>
        <label className="full">
          Image URL
          <input
            name="image"
            type="url"
            placeholder="https://images.unsplash.com/..."
          />
        </label>
        <label>
          Description
          <textarea
            required
            name="description"
            placeholder="Describe the product, ingredients, serving suggestion…"
          />
        </label>
        <label>
          Sizes <small>comma separated</small>
          <input name="sizes" placeholder="1 Pound, 2 Pound, 3 Pound" />
        </label>
        <label>
          Flavours <small>comma separated</small>
          <input name="flavors" placeholder="Chocolate, Vanilla" />
        </label>
        <div className="toggles">
          <label>
            <input type="checkbox" name="featured" /> Featured product
          </label>
          <label>
            <input type="checkbox" name="bestSeller" /> Best seller
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit">
            <Plus size={17} /> Publish product
          </button>
        </div>
        <p className="form-message">{message}</p>
      </form>
    </section>
  );
}

function Products({ products, categories, token, refresh }) {
  const [add, setAdd] = useState(false);
  if (add)
    return (
      <ProductForm
        categories={categories}
        token={token}
        onCreated={refresh}
        onCancel={() => setAdd(false)}
      />
    );
  return (
    <section className="panel">
      <div className="section-title">
        <div>
          <p>CATALOG</p>
          <h2>
            All products <span>{products.length}</span>
          </h2>
        </div>
        <button onClick={() => setAdd(true)}>
          <Plus size={17} /> Add product
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Inventory</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td className="product-cell">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" />
                  ) : (
                    <div className="empty-thumb">
                      <CakeSlice size={17} />
                    </div>
                  )}
                  <div>
                    <b>{product.name}</b>
                    <small>{product.slug}</small>
                  </div>
                </td>
                <td>{product.category?.name || "—"}</td>
                <td>
                  <b>{money(product.price)}</b>
                </td>
                <td>
                  <span className={product.stock > 0 ? "stock good" : "stock"}>
                    {product.stock} in stock
                  </span>
                </td>
                <td>
                  <span className={product.isActive ? "badge live" : "badge"}>
                    {product.isActive ? "Live" : "Hidden"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function Orders({ orders }) {
  return (
    <section className="panel">
      <div className="section-title">
        <div>
          <p>FULFILMENT</p>
          <h2>
            Orders <span>{orders.length}</span>
          </h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>
                  <b>{order.orderNumber}</b>
                </td>
                <td>
                  {order.customer?.name || "Customer"}
                  <small>{order.customer?.email}</small>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className="badge pending">
                    {order.orderStatus.replaceAll("_", " ")}
                  </span>
                </td>
                <td>
                  <b>{money(order.total)}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function CustomRequests({ requests, patch, convert }) {
  return (
    <CustomRequestsPanel requests={requests} patch={patch} convert={convert} />
  );
}

export default function App() {
  const [token, setToken] = useState(() =>
    localStorage.getItem("mnb_admin_token"),
  );
  const [tab, setTab] = useState(() => sessionStorage.getItem("mnb_admin_tab") || "Dashboard");
  const [data, setData] = useState({
    products: [],
    categories: [],
    mainCategories: [],
    orders: [],
    requests: [],
    customers: [],
    reviews: [],
    inquiries: [],
    dashboard: {},
    config: {},
    notifications: [],
    stockMovements: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newNotifications, setNewNotifications] = useState([]);
  const showingAlertRef = useRef(false);
  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [
        products,
        categories,
        mainCategories,
        orders,
        requests,
        dashboard,
        customers,
        reviews,
        inquiries,
        config,
        notifications,
        inventoryHistory,
      ] = await Promise.all([
        request("/products", {}, token),
        request("/categories", {}, token),
        request("/main-categories", {}, token),
        request("/orders", {}, token),
        request("/custom-cakes", {}, token),
        request("/admin/dashboard", {}, token),
        request("/admin/customers", {}, token),
        request("/admin/reviews", {}, token),
        request("/admin/inquiries", {}, token),
        request("/admin/config", {}, token),
        request("/admin/notifications", {}, token),
        request("/products/inventory-history", {}, token),
      ]);
      setData({
        products: products.products,
        categories: categories.categories,
        mainCategories: mainCategories.mainCategories,
        orders: orders.orders,
        requests: requests.requests,
        dashboard,
        customers: customers.customers,
        reviews: reviews.reviews,
        inquiries: inquiries.inquiries,
        config: config.config,
        notifications: notifications.notifications,
        stockMovements: inventoryHistory.movements,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  useEffect(() => {
    sessionStorage.setItem("mnb_admin_tab", tab);
  }, [tab]);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.querySelector(".admin-content")?.scrollTo?.({ top: 0, left: 0, behavior: "instant" });
  }, [tab]);
  useEffect(() => {
    if (!token) return undefined;
    const loadNotifications = async () => {
      try {
        const result = await request("/admin/notifications", {}, token);
        setData(current => ({ ...current, notifications: result.notifications }));
      } catch { /* The full refresh continues to surface connection errors. */ }
    };
    const interval = window.setInterval(loadNotifications, 30000);
    window.addEventListener("focus", loadNotifications);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", loadNotifications);
    };
  }, [token]);
  useEffect(() => {
    const unseen=data.notifications.filter(item=>!item.seen);
    if(!unseen.length||showingAlertRef.current)return;
    showingAlertRef.current=true;
    setNewNotifications(unseen);
    request("/admin/notifications/seen",{method:"POST",body:JSON.stringify({items:unseen})},token).then(()=>setData(current=>({...current,notifications:current.notifications.map(item=>unseen.some(x=>x.type===item.type&&x._id===item._id)?{...item,seen:true}:item)}))).catch(()=>{showingAlertRef.current=false});
  },[data.notifications,token]);
  if (!token) return <Login onLogin={setToken} />;
  const cards = [
    ["Products", data.products.length, Package, "In your bakery catalog"],
    ["Orders", data.orders.length, ShoppingBag, "Orders received"],
    [
      "Customers",
      new Set(data.orders.map((x) => x.customer?._id)).size,
      Users,
      "Customers with orders",
    ],
    ["Custom cakes", data.requests.length, CakeSlice, "Requests to review"],
  ];
  const dashboard = (
    <>
      <div className="welcome">
        <div>
          <p>GOOD TO SEE YOU</p>
          <h1>
            Your bakery is looking <em>beautiful.</em>
          </h1>
          <span>Here is what is happening at My New Bakery today.</span>
        </div>
        <div className="welcome-mark">
          MNB
          <br />
          <i>✦</i>
        </div>
      </div>
      <div className="stats">
        {cards.map(([title, value, Icon, caption]) => (
          <article key={title}>
            <div className="stat-icon">
              <Icon size={19} />
            </div>
            <span>{title}</span>
            <strong>{value}</strong>
            <small>{caption}</small>
          </article>
        ))}
      </div>
      <section className="panel">
        <div className="section-title">
          <div>
            <p>RECENT ACTIVITY</p>
            <h2>Latest orders</h2>
          </div>
          <button className="text-button" onClick={() => setTab("Orders")}>
            View all
          </button>
        </div>
        {data.orders.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.slice(0, 5).map((order) => (
                  <tr key={order._id}>
                    <td>
                      <b>{order.orderNumber}</b>
                    </td>
                    <td>{order.customer?.name}</td>
                    <td>
                      <span className="badge pending">{order.orderStatus}</span>
                    </td>
                    <td>{money(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <ClipboardList />
            <p>Your customer orders will appear here.</p>
          </div>
        )}
      </section>
    </>
  );
  const mutate = async (path, body, method = "PATCH") => {
    await request(path, { method, body: JSON.stringify(body) }, token);
    await refresh();
  };
  const content =
    tab === "Dashboard" ? (
      <Dashboard data={data} onTab={setTab} />
    ) : tab === "Notifications" ? (
      <NotificationsPage items={data.notifications} onOpen={async(item)=>{await refresh();setTab(item.type==="order"?"Orders":item.type==="review"?"Reviews":item.type==="low_stock"?"Inventory":item.type==="inquiry"?"Inquiries":"Custom cakes")}}/>
    ) : tab === "Products" ? (
      <ProductOps
        products={data.products}
        categories={data.categories}
        mainCategories={data.mainCategories}
        patch={(id, b) => mutate(`/products/${id}`, b)}
        create={(b) => mutate("/products", b, "POST")}
        remove={(id) => mutate(`/products/${id}`, {}, "DELETE")}
      />
    ) : tab === "Orders" ? (
      <OrdersAdmin
        orders={data.orders}
        patch={(id, b) => mutate(`/orders/${id}`, b)}
      />
    ) : tab === "Custom cakes" ? (
      <CustomRequests requests={data.requests} />
    ) : tab === "Inventory" ? (
      <Inventory
        products={data.products}
        orders={data.orders}
        movements={data.stockMovements}
        patch={(id, amount) => mutate(`/products/${id}/stock`, { amount })}
      />
    ) : tab === "Categories" ? (
      <Categories
        items={data.categories}
        mainCategories={data.mainCategories}
        patch={(id, b) => mutate(`/categories/${id}`, b)}
        create={(b) => mutate("/categories", b, "POST")}
        remove={(id) => mutate(`/categories/${id}`, {}, "DELETE")}
        createMain={(b) => mutate("/main-categories", b, "POST")}
        patchMain={(id, b) => mutate(`/main-categories/${id}`, b)}
        removeMain={(id) => mutate(`/main-categories/${id}`, {}, "DELETE")}
      />
    ) : tab === "Customers" ? (
      <Customers
        items={data.customers}
        patch={(id, b) => mutate(`/admin/customers/${id}`, b)}
      />
    ) : tab === "Reviews" ? (
      <Reviews
        items={data.reviews}
        patch={(id, status) => mutate(`/admin/reviews/${id}`, { status })}
        remove={(id) => mutate(`/admin/reviews/${id}`, {}, "DELETE")}
      />
    ) : tab === "Inquiries" ? (
      <InquiriesManager
        items={data.inquiries}
        patch={(id, b) => mutate(`/admin/inquiries/${id}`, b)}
        remove={(id) => mutate(`/admin/inquiries/${id}`, {}, "DELETE")}
      />
    ) : tab === "Payments" ? (
      <Payments
        orders={data.orders}
        patch={(id, b) => mutate(`/orders/${id}`, b)}
      />
    ) : (
      <Config
        config={data.config}
        title={tab}
        save={(b) => mutate("/admin/config", b)}
      />
    );
  const links = [
    ["Dashboard", LayoutDashboard],
    ["Orders", ShoppingBag],
    ["Custom cakes", CakeSlice],
    ["Products", Package],
    ["Categories", ClipboardList],
    ["Inventory", Package],
    ["Customers", Users],
    ["Reviews", ClipboardList],
    ["Inquiries", MessageSquare],
    ["Payments", ShoppingBag],
    ["Website Content", LayoutDashboard],
    ["Settings", LayoutDashboard],
  ];
  return (
    <main className="admin">
      <aside>
        <div className="admin-brand">
          <img src={data.config.logo || "/images/logo/logo.jfif"} alt="" />
          <span>{data.config.bakeryName || "My New Bakery"}</span>
        </div>
        <div className="sidebar-menu-scroll">
          <p className="side-label">MAIN MENU</p>
          {links.map(([name, Icon]) => (
            <button
              className={tab === name ? "active" : ""}
              onClick={() => setTab(name)}
              key={name}
            >
              <Icon size={18} />
              {name}
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <span>
            <CheckCircle2 size={15} /> API connected
          </span>
          <button
            className="logout"
            onClick={() => {
              localStorage.removeItem("mnb_admin_token");
              setToken("");
            }}
          >
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>
      <section className="admin-content">
        <header>
          <div>
            <p>{(data.config.bakeryName || "MY NEW BAKERY").toUpperCase()} / ADMIN</p>
            <h2>{tab}</h2>
          </div>
          <div className="admin-header-actions">
            <div className="notification-wrap">
              <button className="notification-button" onClick={() => setTab("Notifications")} aria-label="Notifications">
                <Bell size={18}/>{data.notifications.length > 0 && <b>{data.notifications.length}</b>}
              </button>
            </div>
            <button className="refresh" onClick={refresh} disabled={loading}>
              <RefreshCw size={16} className={loading ? "spin" : ""} />
              {loading ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </header>
        {error ? <div className="admin-error">{error}</div> : content}
      </section>
      {newNotifications.length>0&&<div className="new-order-alert" role="alertdialog" aria-modal="true"><div><span className="alert-bell"><Bell size={26}/></span><p>NEW ACTIVITY</p><h2>{newNotifications.length===1?(newNotifications[0].type==='low_stock'?'A product is running low.':newNotifications[0].type==='custom'?'A custom cake needs attention.':newNotifications[0].type==='review'?'A new customer review needs approval.':newNotifications[0].type==='inquiry'?'A new customer inquiry has arrived.':'A new order needs attention.'):`${newNotifications.length} new notifications need attention.`}</h2><div className="alert-items">{newNotifications.slice(0,4).map(item=><b key={`${item.type}-${item._id}`}>{item.text}</b>)}</div><button onClick={()=>{setNewNotifications([]);showingAlertRef.current=false;setTab("Notifications")}}>View Notifications</button><button className="secondary" onClick={()=>{setNewNotifications([]);showingAlertRef.current=false}}>Close</button></div></div>}
    </main>
  );
}
