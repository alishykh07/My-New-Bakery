import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../services/api.js";
import { catalog } from "../../data/catalog.js";
import ProductCard from "../ProductCard.jsx";
import {
  matchesProductCategory,
  matchesProductDepartment,
  matchesProductSearch,
} from "../../utils/productSearch.js";

export default function ProductCatalog({ type }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(
    catalog.filter((item) => item.type === type),
  );
  const [params] = useSearchParams();
  const activeCategory = params.get("category");
  const department = params.get("department");
  useEffect(() => {
    api(`/products?type=${type}`)
      .then((data) => setItems(data.products))
      .catch(() => {});
  }, [type]);
  const shown = items.filter(
    (item) =>
      matchesProductSearch(item, query) &&
      matchesProductCategory(item, activeCategory) &&
      matchesProductDepartment(item, department),
  );
  const config =
    type === "cakes"
      ? {
          title:
            activeCategory ||
            department?.replace(/^./, (letter) => letter.toUpperCase()) ||
            "Cakes made for moments",
          copy: "Choose your favourites, select a size and order online for delivery or pickup.",
        }
      : {
          title:
            activeCategory ||
            department?.replace(/^./, (letter) => letter.toUpperCase()) ||
            "Golden, flaky pastries",
          copy: "Freshly baked savoury favourites for every gathering.",
        };
  return (
    <main className="page-shell">
      <p className="eyebrow text-[#8f4a14]">My New Bakery shop</p>
      <h1 className="page-title">{config.title}</h1>
      <p className="page-copy">{config.copy}</p>
      <input
        className="input-field mt-10 max-w-md"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name, flavour, category or type"
      />
      <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
        {shown.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
      {!shown.length && (
        <p className="mt-10 text-sm text-[#764c35]">
          No matching bakery item found. Try another name, flavour, category or
          type.
        </p>
      )}
    </main>
  );
}
