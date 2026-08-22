import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { RatingInput, RatingStars } from "../components/Reviews/RatingStars.jsx";
import { api } from "../services/api.js";
import { catalog } from "../data/catalog.js";
import { useStore } from "../context/StoreContext.jsx";
import { formatPrice } from "../utils/formatPrice.js";
import { useSiteConfig } from "../services/siteConfig.js";

export default function ProductPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const fallback = catalog.find((item) => item.slug === slug);
  const [product, setProduct] = useState(fallback);
  const [size, setSize] = useState(fallback?.sizes?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const { add, user } = useStore();
  const config = useSiteConfig();
  const loadReviews = (id) =>
    api(`/reviews/product/${id}`)
      .then((data) => {
        setReviews(data.reviews);
        setAverage(data.average);
      })
      .catch(() => {});
  useEffect(() => {
    api(`/products/${slug}`)
      .then((data) => {
        setProduct(data.product);
        setSize(data.product.sizes?.[0]);
        loadReviews(data.product._id);
      })
      .catch(() => {});
  }, [slug]);
  async function submitReview(event) {
    event.preventDefault();
    if (!user) {
      setMessage("Please login before leaving a review.");
      return;
    }
    try {
      const data = await api("/reviews", {
        method: "POST",
        body: JSON.stringify({ product: product._id, rating, comment }),
      });
      setMessage(data.message);
      setComment("");
    } catch (error) {
      setMessage(error.message);
    }
  }
  if (!product)
    return (
      <main className="page-shell">
        <h1 className="page-title">Product not found</h1>
      </main>
    );
  const image = product.images?.[0] || product.image;
  const variants = product.variants?.length ? product.variants : (product.sizes || []).map((label) => ({ label, price: product.price }));
  const selectedVariant = variants.find((option) => option.label === size) || variants[0];
  const selectedPrice = selectedVariant?.price ?? product.price;
  return (
    <main className="page-shell">
      <Link
        className="text-[10px] font-bold tracking-[.13em] uppercase"
        to={`/${product.type}`}
      >
        ← Back to shop
      </Link>
      <div className="mt-9 grid gap-12 md:grid-cols-[1.1fr_.9fr] md:items-start">
        <img
          className="aspect-[.86] w-full object-cover shadow-[20px_20px_0_#ffd974]"
          src={image}
          alt={product.name}
        />
        <div>
          <p className="eyebrow text-[#8f4a14]">
            {product.category?.name || product.category}
          </p>
          <h1 className="page-title">{product.name}</h1>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Star size={16} fill="#fece00" className="text-gold" />
            <b>{average ? average.toFixed(1) : "New"}</b>
            <span className="text-[#805941]">
              ({reviews.length} approved review{reviews.length === 1 ? "" : "s"}
              )
            </span>
          </div>
          <strong className="mt-5 block text-lg">
            {formatPrice(selectedPrice)}
          </strong>
          <p className="mt-7 text-sm leading-7 text-[#764c35]">
            {product.description}
          </p>
          {(config.deliveryNote||config.estimatedDeliveryTime||Number(config.freeDeliveryThreshold)>0)&&<div className="mt-5 border border-[#d7bc80] bg-white/45 p-4 text-xs leading-5 text-[#764c35]"><b className="block text-[#3b0e06]">Delivery information</b>{Number(config.freeDeliveryThreshold)>0&&<span className="block font-bold text-[#8f4a14]">Free delivery above {formatPrice(Number(config.freeDeliveryThreshold))}</span>}{config.deliveryNote&&<span className="block">{config.deliveryNote}</span>}{config.estimatedDeliveryTime&&<span className="block">Estimated time: {config.estimatedDeliveryTime}</span>}</div>}
          <label className="mt-7 block text-[10px] font-bold tracking-[.14em] uppercase">
            Choose size / quantity
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {variants.map((option) => (
              <button
                onClick={() => setSize(option.label)}
                className={`border px-4 py-3 text-xs ${size === option.label ? "border-bakery bg-bakery text-cream" : "border-[#d7bc80] bg-white/70"}`}
                key={option.label}
              >
                {option.label} · {formatPrice(option.price)}
              </button>
            ))}
          </div>
          <div className="mt-7 flex w-fit items-center border border-[#d7bc80]">
            <button
              className="p-3"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              <Minus size={16} />
            </button>
            <span className="w-9 text-center text-sm">{quantity}</span>
            <button
              className="p-3"
              onClick={() => setQuantity((value) => value + 1)}
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={() => {
              add({ ...product, size: selectedVariant?.label || size, price: selectedPrice, quantity });
              navigate("/cart");
            }}
            className="gold-button mt-6 w-full justify-center"
          >
            Add to bag <ShoppingBag size={17} />
          </button>
        </div>
      </div>
      <section className="mt-20 grid gap-8 border-t border-[#d9bd7c] pt-10 lg:grid-cols-[.8fr_1.2fr]">
        <form onSubmit={submitReview} className="surface-card">
          <p className="eyebrow text-[#8f4a14]">Your experience</p>
          <h2 className="font-display text-3xl">Rate this product</h2>
          <div className="mt-5"><RatingInput value={rating} onChange={setRating} size={28}/></div>
          <textarea
            className="input-field mt-5 min-h-28"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you loved"
            required
          />
          <button className="gold-button mt-4">Submit review</button>
          <p className="mt-4 text-sm text-[#8f4a14]">{message}</p>
        </form>
        <div>
          <p className="eyebrow text-[#8f4a14]">Customer reviews</p>
          {reviews.length ? (
            reviews.map((review) => (
              <article
                key={review._id}
                className="border-b border-[#d9bd7c] py-5"
              >
                <RatingStars value={review.rating} size={15}/>
                <p className="mt-3 text-sm leading-6">{review.comment}</p>
                <small className="mt-2 block text-[#805941]">
                  {review.customer?.name} ·{" "}
                  {new Date(review.createdAt).toLocaleDateString()}
                </small>
              </article>
            ))
          ) : (
            <p className="mt-4 text-sm text-[#805941]">
              Be the first customer to review this product.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
