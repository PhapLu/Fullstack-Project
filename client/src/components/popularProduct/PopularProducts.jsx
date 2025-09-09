import React, { useEffect, useState } from "react";
import styles from "./PopularProducts.module.scss";
import { Link } from "react-router-dom";
import { apiUtils } from "../../utils/newRequest";
import { getImageUrl } from "../../utils/imageUrl";
import { Pagination } from "./Pagination";
import { usd } from "../../utils/currency";
import { useMemo } from "react";
import { useRef } from "react";

export default function PopularProducts() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(15);


  // --- Filter / Sort UI state ---
  const [panelOpen, setPanelOpen] = useState(false);
  // mode: "none" | "range" | "asc" | "desc"
  const [mode, setMode] = useState("none");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const panelRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);
  const fetchProducts = async (params = {}) => {
    try {
      const response = await apiUtils.get("/product/readProducts", {
        params,
      });
      setProducts(response.data.metadata.products);
    } catch (error) {
      console.error("Error fetching popular products:", error);
    }
  };

  // Close panel on outside click
  useEffect(() => {
    if (!panelOpen) return;
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [panelOpen]);

  // Derived list after filter/sort
  const processed = useMemo(() => {
    let list = Array.isArray(products) ? [...products] : [];

    if (mode === "range") {
      const min = minPrice === "" ? -Infinity : Number(minPrice);
      const max = maxPrice === "" ? Infinity : Number(maxPrice);
      list = list.filter((p) => {
        const price = Number(p.price) || 0;
        return price >= min && price <= max;
      });
      // Optional: keep original order, or sort ascending for range filters.
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (mode === "asc") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (mode === "desc") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    }
    return list;
  }, [products, mode, minPrice, maxPrice]);

  // Reset to first page when filters/sorts change
  useEffect(() => {
    setCurrentPage(1);
  }, [mode, minPrice, maxPrice]);

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  function formatStock(stock) {
    if (stock >= 1000) {
      const k = Math.floor(stock / 1000);
      return `${k}k+`;
    }
    return stock.toString();
  }

  // Change page of pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handlers
  const applyRange = () => {
    const query = {};
    if (minPrice) query.minPrice = minPrice;
    if (maxPrice) query.maxPrice = maxPrice;

    fetchProducts(query);
    setMode("range");
    setPanelOpen(false);
  };

  const clearFilters = () => {
    setMode("none");
    setMinPrice("");
    setMaxPrice("");
    fetchProducts(); // reload all products
    setPanelOpen(false);
  };

  return (
    <section className={`${styles.popular} ${styles.container}`} id="popular">
      <div className={`${styles.popular__header}`}>
        <h2>Popular Products</h2>
        {/* Filter / Sort */}
        <div className={styles.filterWrap}>
          <button
            type="button"
            className={styles.filterBtn}
            onClick={() => setPanelOpen((s) => !s)}
            aria-expanded={panelOpen}
            aria-haspopup="dialog"
          >
            Filter
          </button>

          {panelOpen && (
            <div
              className={styles.filterPanel}
              ref={panelRef}
              role="dialog"
              aria-label="Filter and sort by price"
            >
              <div className={styles.option}>
                <label className={styles.radio}>
                  <span>Price range</span>
                </label>
                <div className={styles.rangeRow}>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className={styles.priceInput}
                  />
                  <span className={styles.dash}>—</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className={styles.priceInput}
                  />
                  <button
                    type="button"
                    className={styles.applyBtn}
                    onClick={applyRange}
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className={styles.divider} />

              <label className={styles.radio}>
                <input
                  type="radio"
                  name="sortmode"
                  checked={mode === "desc"}
                  onChange={() => {
                    setMode("desc");
                  }}
                />
                <span>Sort by highest price</span>
              </label>

              <label className={styles.radio}>
                <input
                  type="radio"
                  name="sortmode"
                  checked={mode === "asc"}
                  onChange={() => {
                    setMode("asc");
                  }}
                />
                <span>Sort by lowest price</span>
              </label>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={clearFilters}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles["popular-grid"]}>
        {/* Link to product:id */}
        {currentProducts.map((p) => (
          <Link
            to={`/product/${p._id}`}
            key={p._id}
            className={styles["pop-card"]}
          >
            <article>
              <div className={styles.thumb}>
                <img
                  src={getImageUrl(p.images[0])}
                  alt={p.title}
                  loading="lazy"
                />
              </div>
              <div className={styles.info}>
                <h3 title={p.title}>{p.title}</h3>
                <p className={styles.desc} title={p.description}>
                  {p.description}
                </p>
                <div className={styles.info__bottom}>
                  <span className={styles["price-link"]}>{usd(p.price)}</span>
                  <span className={styles["stock-link"]}>
                    In stock: {formatStock(p.stock)}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
      <Pagination
        productsPerPage={productsPerPage}
        totalProducts={products.length}
        paginate={paginate}
      />
    </section>
  );
}
