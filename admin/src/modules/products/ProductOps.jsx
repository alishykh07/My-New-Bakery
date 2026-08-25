import { useMemo, useState } from "react";
import "./product-ops.css";
import "./product-thumbnails.css";
const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "").replace(/\/$/, ""),
  money = (v) => `Rs. ${(v || 0).toLocaleString()}`,
  src = (v) => (v?.startsWith("/uploads/") ? `${API}${v}` : v);
export default function ProductOps({ products, categories, mainCategories = [], patch, create, remove }) {
  const [editing, setEditing] = useState(null),
    [department, setDepartment] = useState(mainCategories[0]?.slug || ""),
    [file, setFile] = useState(null),
    [preview, setPreview] = useState(""),
    [variants, setVariants] = useState([{ label: "", price: "" }]),
    [error, setError] = useState("");
  const selectedMain = mainCategories.find(item => item.slug === department) || mainCategories[0];
  const filtered = useMemo(
    () => categories.filter(category => category.department === department),
    [categories, department],
  );
  function start(item = {}) {
    setDepartment(item.department || item.category?.department || mainCategories[0]?.slug || "");
    setFile(null);
    setPreview(src(item.images?.[0]) || "");
    setVariants(item.variants?.length ? item.variants.map((option) => ({ label: option.label, price: option.price })) : item.sizes?.length ? item.sizes.map((label) => ({ label, price: item.price })) : [{ label: "", price: "" }]);
    setError("");
    setEditing(item);
  }
  async function save(e) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget),
      category = categories.find((c) => c._id === form.get("category"));
    if (!category) return setError("Please select a subcategory.");
    try {
      let image = editing.images?.[0];
      if (file) {
        const upload = new FormData();
        upload.append("image", file);
        upload.append("category", category._id);
        const response = await fetch(`${API}/api/products/upload-image`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("mnb_admin_token")}`,
            },
            body: upload,
          }),
          data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Image upload failed");
        image = data.image;
      }
      if (!image) return setError("Please choose a product image.");
      const cleanVariants = variants.map((option) => ({ label: option.label.trim(), price: Number(option.price), hasPrice: String(option.price).trim() !== "" })).filter((option) => option.label && option.hasPrice && Number.isFinite(option.price) && option.price >= 0).map(({ label, price }) => ({ label, price }));
      if (!cleanVariants.length) return setError("Add at least one size or quantity with its price.");
      if (cleanVariants.length !== variants.length) return setError("Every size/quantity needs a name and a valid price.");
      const name = form.get("name"),
        body = {
          name,
          department,
          category: category._id,
          type: selectedMain?.productType || category.type || "cakes",
          price: Math.min(...cleanVariants.map((option) => option.price)),
          stock: +form.get("stock"),
          lowStockThreshold: +form.get("lowStockThreshold"),
          images: [image],
          description: form.get("description"),
          sizes: cleanVariants.map((option) => option.label),
          variants: cleanVariants,
          flavors: form
            .get("flavors")
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          slug: editing.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          featured: form.get("featured") === "on",
          bestSeller: form.get("bestSeller") === "on",
          isActive: true,
        };
      editing._id ? await patch(editing._id, body) : await create(body);
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  }
  if (editing !== null) {
    const item = editing || {};
    return (
      <section className="product-form-wrap">
        <div className="section-title">
          <div>
            <p>MANAGEMENT</p>
            <h2>{item._id ? "Edit product" : "Add product"}</h2>
          </div>
        </div>
        <form className="product-form" onSubmit={save}>
          <label>
            Main category
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {mainCategories.filter(item => item.isActive !== false).map(item => (
                <option key={item._id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Subcategory
            <select
              name="category"
              required
              defaultValue={item.category?._id || item.category || ""}
            >
              <option value="" disabled>
                Select subcategory
              </option>
              {filtered.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Name
            <input name="name" required defaultValue={item.name} />
          </label>
          <label>
            Stock
            <input
              name="stock"
              type="number"
              min="0"
              defaultValue={item.stock || 0}
            />
          </label>
          <label>
            Low stock threshold
            <input
              name="lowStockThreshold"
              type="number"
              min="0"
              defaultValue={item.lowStockThreshold ?? 5}
            />
          </label>
          <label className="full">
            Product image
            <input
              type="file"
              accept="image/*"
              required={!item.images?.length}
              onChange={(e) => {
                const chosen = e.target.files?.[0];
                setFile(chosen || null);
                setPreview(
                  chosen
                    ? URL.createObjectURL(chosen)
                    : src(item.images?.[0]) || "",
                );
              }}
            />
          </label>
          {preview && (
            <div className="product-image-preview">
              <img src={preview} alt="Product preview" />
              <span>Selected image preview</span>
            </div>
          )}
          <label className="full">
            Description
            <textarea name="description" defaultValue={item.description} />
          </label>
          <div className="full product-variants">
            <div className="product-variants-heading">
              <label>Sizes / quantities and their prices</label>
              <button type="button" className="secondary" onClick={() => setVariants((current) => [...current, { label: "", price: "" }])}>Add option</button>
            </div>
            <p>Example: 1 Pound — Rs. 1800, 6 Pieces — Rs. 900</p>
            {variants.map((option, index) => (
              <div className="product-variant-row" key={index}>
                <input aria-label="Size or quantity" placeholder="e.g. 1 Pound / 6 Pieces" value={option.label} onChange={(e) => setVariants((current) => current.map((row, i) => i === index ? { ...row, label: e.target.value } : row))}/>
                <input aria-label="Price" type="number" min="0" placeholder="Price in Rs." value={option.price} onChange={(e) => setVariants((current) => current.map((row, i) => i === index ? { ...row, price: e.target.value } : row))}/>
                <button type="button" className="danger" disabled={variants.length === 1} onClick={() => setVariants((current) => current.filter((_, i) => i !== index))}>Remove</button>
              </div>
            ))}
          </div>
          <label>
            Flavours
            <input name="flavors" defaultValue={item.flavors?.join(", ")} />
          </label>
          <div className="toggles">
            <label>
              <input
                name="featured"
                type="checkbox"
                defaultChecked={item.featured}
              />
              Featured
            </label>
            <label>
              <input
                name="bestSeller"
                type="checkbox"
                defaultChecked={item.bestSeller}
              />
              Best seller
            </label>
          </div>
          {error && <p className="form-message product-error">{error}</p>}
          <div className="form-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
            <button>Save product</button>
          </div>
        </form>
      </section>
    );
  }
  return (
    <section className="panel">
      <div className="section-title toolbar">
        <div>
          <p>MANAGEMENT</p>
          <h2>
            Products <span>{products.length}</span>
          </h2>
        </div>
        <button onClick={() => start({})}>Add product</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Main category</th>
              <th>Subcategory</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item._id}>
                <td>
                  <div className="product-list-item">
                    {item.images?.[0] ? (
                      <img src={src(item.images[0])} alt="" />
                    ) : (
                      <span className="product-no-image">No image</span>
                    )}
                    <div>
                      <b>{item.name}</b>
                      <small>
                        {item.archived
                          ? "Archived"
                          : item.isActive
                            ? "Live"
                            : "Hidden"}
                      </small>
                    </div>
                  </div>
                </td>
                <td>
                  {mainCategories.find(category => category.slug === item.department)?.name || item.department}
                </td>
                <td>{item.category?.name}</td>
                <td>{money(item.price)}</td>
                <td>{item.stock}</td>
                <td>{item.featured ? "Yes" : "No"}</td>
                <td>
                  <div className="product-actions">
                    <button onClick={() => start(item)}>Edit</button>
                    <button
                      className="secondary"
                      onClick={() =>
                        patch(item._id, item.isActive
                          ? { isActive: false }
                          : { isActive: true, archived: false })
                      }
                    >
                      {item.isActive ? "Hide" : "Show"}
                    </button>
                    <button
                      className="danger product-delete"
                      onClick={() => {
                        if (window.confirm(`Permanently delete “${item.name}”? This cannot be undone.`)) remove(item._id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
