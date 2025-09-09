/* Gia Hy-s4053650 */
import React, { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiUtils } from "../../utils/newRequest";
import cls from "./searching.module.scss";
import { getImageUrl } from "../../utils/imageUrl";

export default function Searching() {
    const [params] = useSearchParams();
    const query = (params.get("query") || "").trim();

    const [products, setProducts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);

    // UI state
    const [view, setView] = useState("product"); // product | vendor
    const [sort, setSort] = useState(null); // newest | oldest | priceAsc | priceDesc
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const PAGE_SIZE = 24;

    // Fetch products when query changes
    useEffect(() => {
        if (!query) return;
        setLoading(true);
        apiUtils
            .get("/product/searchProducts", { params: { search: query } })
            .then((res) => {
                setProducts(res.data.metadata?.products || []);
            })
            .catch((err) => console.error("Search failed:", err))
            .finally(() => setLoading(false));
    }, [query]);

    // Reset pagination when results or query change
    useEffect(() => {
        setTotalPages(Math.ceil(products.length / PAGE_SIZE) || 1);
        setPage(1);
    }, [products, query]);

    const fmtUSD = (n) =>
        typeof n === "number"
            ? Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
              }).format(n)
            : "";

    // --- Product list after sorting + pagination ---
    const productList = useMemo(() => {
        let arr = products;

        if (sort === "newest") {
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
    }, [products, sort, page]);

    // --- Vendor list (for now just client-side filtering, fake data placeholder) ---
    const vendorList = useMemo(() => {
        let arr = vendors;
        if (sort === "newest") {
            arr = [...arr].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
        } else if (sort === "oldest") {
            arr = [...arr].sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
        }
        return arr;
    }, [vendors, sort]);

    const onPageChange = (newPage) => setPage(newPage);

    return (
        <div className={cls.wrap}>
            {/* Sidebar filters */}
            <aside className={cls.sidebar} aria-label="Filters">
                <h3 className={cls.sidebarTitle}>Results for “{query}”</h3>
                <ul className={cls.filterList}>
                    <li>
                        <button
                            className={sort === "newest" ? cls.activeBtn : ""}
                            onClick={() => setSort("newest")}
                        >
                            Newest
                        </button>
                    </li>
                    <li>
                        <button
                            className={sort === "oldest" ? cls.activeBtn : ""}
                            onClick={() => setSort("oldest")}
                        >
                            Oldest
                        </button>
                    </li>
                    <li className={cls.sortGroup}>
                        <span>Sort by price</span>
                        <div className={cls.sortBtns}>
                            <button
                                className={
                                    sort === "priceAsc" ? cls.activeBtn : ""
                                }
                                onClick={() => setSort("priceAsc")}
                            >
                                Low to High
                            </button>
                            <button
                                className={
                                    sort === "priceDesc" ? cls.activeBtn : ""
                                }
                                onClick={() => setSort("priceDesc")}
                            >
                                High to Low
                            </button>
                        </div>
                    </li>
                </ul>
            </aside>

            {/* Main content */}
            <main className={cls.main}>
                {loading && <div className={cls.loading}>Loading...</div>}

                {view === "product" ? (
                    <>
                        <section className={cls.grid} aria-label="Products">
                            {productList.map((p) => {
                                const id = p._id;
                                const title = p.title || "Untitled product";
                                const image = getImageUrl(p.images[0]);

                                return (
                                    <article key={id} className={cls.card}>
                                        <Link
                                            to={`/product/${id}`}
                                            className={cls.thumb}
                                        >
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={title}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className={cls.noImg} />
                                            )}
                                        </Link>
                                        <div className={cls.cardBody}>
                                            <h3
                                                className={cls.title}
                                                title={title}
                                            >
                                                <Link to={`/product/${id}`}>
                                                    {title}
                                                </Link>
                                            </h3>
                                            <div className={cls.priceRow}>
                                                <span className={cls.price}>
                                                    {fmtUSD(p.price)}
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}

                            {/* Empty state */}
                            {productList.length === 0 && !loading && (
                                <div className={cls.empty}>
                                    No products found.
                                </div>
                            )}

                        </section>

                        {/* Pagination */}
                        <nav
                            className={cls.numericPager}
                            aria-label="Pagination"
                        >
                            <button
                                className={cls.navArrow}
                                disabled={page <= 1}
                                onClick={() => onPageChange(page - 1)}
                                aria-label="Previous page"
                            >
                                ‹
                            </button>
                            {renderPageItems({
                                page,
                                totalPages,
                                onPageChange,
                                cls,
                            })}
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
                    <section className={cls.vendorRow} aria-label="Vendors">
                        {vendorList.map((v) => {
                            const id = v._id;
                            const name =
                                v?.vendorProfile?.businessName || "Vendor";
                            const avatar = v?.avatar;

                            return (
                                <Link
                                    key={id}
                                    to={`/vendor/${id}`}
                                    className={cls.vendorCard}
                                >
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
                        {vendorList.length === 0 && !loading && (
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
        if (prev && n - prev > 1) {
            out.push(
                <span key={`gap-${prev}`} className={cls.gap}>
                    …
                </span>
            );
        }
        out.push(
            <button
                key={`p-${n}`}
                className={`${cls.pageBtn} ${
                    n === page ? cls.currentPage : ""
                }`}
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
