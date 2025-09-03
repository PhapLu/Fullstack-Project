import React, { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import cls from "./searching.module.scss";

export default function Searching({
  products = [],
  vendors = [],
  signedIn = false,
  page = 1,
  totalPages = 1,
  onPageChange = () => {},
}) {
  const [params] = useSearchParams();
  const query = (params.get("query") || "").trim().toLowerCase();

  const [view, setView] = useState("product");
  const [sort, setSort] = useState(null);

  useEffect(() => {
    onPageChange(1);
  }, [query, view, sort]);

  const fmtUSD = (n) =>
    typeof n === "number"
      ? Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(n)
      : "";

  const byQuery = (text) =>
    !query || (text || "").toLowerCase().includes(query);

  const PAGE_SIZE = 24;

  const productList = useMemo(() => {
    let arr = products.filter((p) => byQuery(p.title || p.name || ""));

    if (sort === "latest") {
      arr = [...arr].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sort === "oldest") {
      arr = [...arr].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    } else if (sort === "priceAsc") {
      arr = [...arr].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sort === "priceDesc") {
      arr = [...arr].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }

    const start = (page - 1) * PAGE_SIZE;
    return arr.slice(start, start + PAGE_SIZE);
  }, [products, query, sort, page]);

  const vendorList = useMemo(() => {
    let arr = vendors.filter((v) =>
      byQuery(v?.vendorProfile?.businessName || "")
    );

    if (sort === "latest") {
      arr = [...arr].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sort === "oldest") {
      arr = [...arr].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }
    return arr;
  }, [vendors, query, sort]);

  return (
    <div className={cls.wrap}>
      {/* LEFT: vertical filter list */}
      <aside className={cls.sidebar} aria-label="Filters">
        <h3 className={cls.sidebarTitle}>Results for “{query}”</h3>
        <ul className={cls.filterList}>
          <li>
            <button
              className={view === "product" ? cls.activeBtn : ""}
              onClick={() => setView("product")}
            >
              Product
            </button>
          </li>
          <li>
            <button
              className={view === "vendor" ? cls.activeBtn : ""}
              onClick={() => setView("vendor")}
            >
              Vendor
            </button>
          </li>
          <li>
            <button onClick={() => setSort("newest")}>Newest</button>
          </li>
          <li>
            <button onClick={() => setSort("latest")}>Latest</button>
          </li>
          <li className={cls.sortGroup}>
            <span>Sort by price</span>
            <div className={cls.sortBtns}>
              <button onClick={() => setSort("priceAsc")}>Low to High</button>
              <button onClick={() => setSort("priceDesc")}>High to Low</button>
            </div>
          </li>
        </ul>
      </aside>

      {/* RIGHT: content */}
      <main className={cls.main}>
        {/* Product Grid */}
        {view === "product" ? (
          <>
            <section className={cls.grid} aria-label="Products">
              {productList.map((p) => {
                const id = p._id;
                const title = p.title || p.name || "Untitled product";
                const image = (p.images && p.images[0]) || p.thumbnail;

                return (
                  <article key={id} className={cls.card}>
                    <Link to={`/product/${id}`} className={cls.thumb}>
                      {image ? (
                        <img src={image} alt={title} loading="lazy" />
                      ) : (
                        <div className={cls.noImg} />
                      )}
                    </Link>
                    <div className={cls.cardBody}>
                      <h3 className={cls.title} title={title}>
                        <Link to={`/product/${id}`}>{title}</Link>
                      </h3>
                      <div className={cls.priceRow}>
                        <span className={cls.price}>{fmtUSD(p.price)}</span>
                      </div>
                      <Link to={`/product/${id}`} className={cls.cta}>
                        View
                      </Link>
                    </div>
                  </article>
                );
              })}

              {/* Page */}
              {Array.from({
                length: Math.max(0, PAGE_SIZE - productList.length),
              }).map((_, i) => (
                <div key={`ph-${i}`} className={cls.placeholder} aria-hidden />
              ))}
            </section>
            <nav className={cls.numericPager} aria-label="Pagination">
              <button
                className={cls.navArrow}
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                aria-label="Previous page"
              >
                ‹
              </button>
              {renderPageItems({ page, totalPages, onPageChange, cls })}
              <button
                className={cls.navArrow}
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                aria-label="Next page"
              >
                ›
              </button>
            </nav>
          </>
        ) : (
          /* Vendor view */
          <section className={cls.vendorRow} aria-label="Vendors">
            {vendorList.map((v) => {
              const id = v._id;
              const name = v?.vendorProfile?.businessName || "Vendor";
              const avatar = v?.avatar;

              return (
                <Link key={id} to={`/vendor/${id}`} className={cls.vendorCard}>
                  <div className={cls.vendorAvatar}>
                    {avatar ? (
                      <img src={avatar} alt={name} />
                    ) : (
                      <div className={cls.noImg} />
                    )}
                  </div>
                  <div className={cls.vendorName}>{name}</div>
                </Link>
              );
            })}
            {vendorList.length === 0 && (
              <div className={cls.vendorEmpty}>
                No vendors match your search.
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function renderPageItems({ page, totalPages, onPageChange, cls }) {
  const items = new Set([
    1,
    totalPages,
    page,
    page - 1,
    page + 1,
    page - 2,
    page + 2,
  ]);
  const sorted = [...items]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1)
      out.push(
        <span key={`gap-${prev}`} className={cls.gap}>
          …
        </span>
      );
    out.push(
      <button
        key={`p-${n}`}
        className={`${cls.pageBtn} ${n === page ? cls.currentPage : ""}`}
        onClick={() => onPageChange(n)}
        aria-current={n === page ? "page" : undefined}
      >
        {n}
      </button>
    );
    prev = n;
  }
  return out;
}
