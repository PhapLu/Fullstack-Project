import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import styles from "./ProductDetail.module.scss";
import { apiUtils } from "../../utils/newRequest";
import { getImageUrl } from "../../utils/imageUrl";
import { useCart } from "../../store/cart/CartContext";
import ReviewForm from "./components/ReviewForm";
import ReviewList from "./components/ReviewList";
import { buildCheckoutPayload, startCheckout } from "../../utils/checkoutState";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlices";

export default function ProductDetail() {
    const location = useLocation();
    const state = location.state || {};
    const navigate = useNavigate();
    const { addItem } = useCart();
    const user = useSelector(selectUser);

    useEffect(() => {
        if (location.hash) {
            const el = document.querySelector(location.hash);
            if (el) {
                el.scrollIntoView({ behavior: "smooth"});
            }
        }
    }, [location]);

    const { productId: routeProductId } = useParams();

    const [product, setProduct] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    const orderId = state.orderId;

    const dec = () => setQty((q) => Math.max(1, q - 1));
    const inc = () => setQty((q) => q + 1);

    const isValidObjectId = (v) => /^[a-f\d]{24}$/i.test(String(v || ""));

    useEffect(() => setActiveIndex(0), [routeProductId]);

    const gallery = useMemo(() => {
        const arr = Array.isArray(product?.images) ? product.images : [];
        return arr.length ? arr : product?.thumbnail ? [product.thumbnail] : [];
    }, [product]);

    // Fetch product
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                const res = await apiUtils.get(
                    `/product/readProduct/${routeProductId}`
                );
                if (!cancelled) setProduct(res.data.metadata.product);
            } catch (e) {
                if (!cancelled && e.name !== "AbortError") setError(e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [routeProductId]);

    const handleAddToCart = async () => {
        if (!product || adding) return;
        setAdding(true);
        try {
            await addItem({
                id: routeProductId,
                name: product.title || product.name,
                price: product.price,
                image: getImageUrl(product.images?.[0] || product.thumbnail),
                stock: product.stock,
                classification: product.variant,
                qty,
            });
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 1600);
        } finally {
            setAdding(false);
        }
    };

    const handleBuyNow = () => {
        if (!product) return;
        const oneItem = {
            id: routeProductId,
            qty,
            price: product.price,
            name: product.title || product.name,
            image: getImageUrl(product?.images?.[0] || product?.thumbnail),
        };
        const payload = buildCheckoutPayload({
            items: [oneItem],
            currency: "USD",
        });
        startCheckout(navigate, payload);
    };

    return (
        <>
            <div className={styles.page}>
                <div className={styles.layout}>
                    {/* Left: Gallery */}
                    <section
                        className={styles.gallery}
                        aria-label="Product gallery"
                    >
                        <div className={styles.hero} aria-hidden="true">
                            {gallery[activeIndex] && (
                                <img
                                    src={getImageUrl(gallery[activeIndex])}
                                    alt={product?.title || "Product image"}
                                />
                            )}
                        </div>

                        <div
                            className={styles.thumbs}
                            role="listbox"
                            aria-label="Thumbnails"
                        >
                            {gallery.map((img, i) => (
                                <button
                                    type="button"
                                    key={i}
                                    className={`${styles.thumb} ${
                                        i === activeIndex ? styles.active : ""
                                    }`}
                                    aria-pressed={i === activeIndex}
                                    aria-label={`Show image ${i + 1}`}
                                    onClick={() => setActiveIndex(i)}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                        ) {
                                            e.preventDefault();
                                            setActiveIndex(i);
                                        }
                                    }}
                                >
                                    <img
                                        src={getImageUrl(img)}
                                        alt={`Thumbnail ${i + 1}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Right: Info */}
                    <section className={styles.info}>
                        <div className={styles.sellerRow}>
                            <div className={styles.sellerLeft}>
                                <div
                                    className={styles.avatar}
                                    aria-hidden="true"
                                >
                                    <img
                                        src={getImageUrl(
                                            product?.vendorId?.avatar
                                        )}
                                        alt=""
                                    />
                                </div>
                                <div className={styles.sellerMeta}>
                                    <div className={styles.sellerName}>
                                        {
                                            product?.vendorId?.vendorProfile
                                                ?.businessName
                                        }
                                    </div>
                                    <Link
                                        to={`/vendor/${product?.vendorId?._id}`}
                                        className={styles.seeProfile}
                                    >
                                        See profile
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <h1 className={styles.title}>{product?.title}</h1>

                        <div className={styles.field}>
                            <div id="price" className={styles.price}>
                                ${product?.price}
                            </div>
                        </div>

                        <div className={styles.deliveryRow}>
                            <span className={styles.deliveryLabel}>
                                Delivery on:
                            </span>
                            <span
                                className={styles.deliveryIcon}
                                aria-hidden="true"
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18">
                                    <path
                                        d="M3 7h11v6h2.5l2-3H21v7h-1a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H3V7z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </span>
                            <span className={styles.deliveryText}>
                                Delivery within 3–4 days after handover to the
                                carrier
                            </span>
                        </div>

                        <div className={styles.amountRow}>
                            <span className={styles.amountLabel}>Amount</span>
                            <div
                                className={styles.stepper}
                                role="group"
                                aria-label="Quantity"
                            >
                                <button
                                    type="button"
                                    onClick={dec}
                                    aria-label="Decrease"
                                    className="left"
                                >
                                    –
                                </button>
                                <input
                                    className={styles.qty}
                                    value={qty}
                                    readOnly
                                    aria-live="polite"
                                />
                                <button
                                    type="button"
                                    onClick={inc}
                                    aria-label="Increase"
                                    className="right"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {user && user.role !== "customer" ? (
                            <></>
                        ) : (
                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    className={styles.addToCart}
                                    onClick={handleAddToCart}
                                    disabled={loading || !product || adding}
                                >
                                    <span
                                        className={styles.cartIcon}
                                        aria-hidden="true"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="18"
                                            height="18"
                                        >
                                            <path
                                                d="M7 4h-2l-1 2v2h2l3.6 7.59L8.25 18a1 1 0 0 0 0 2H19v-2H9.42l1-2H18a1 1 0 0 0 .92-.62L22 9H7.42L6.16 6H22V4H7z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </span>
                                    {adding ? "Adding…" : "Add to cart"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleBuyNow}
                                    disabled={loading || !product}
                                    className={styles.buyNow}
                                >
                                    Buy now
                                </button>
                                <span
                                    role="status"
                                    aria-live="polite"
                                    style={{ marginLeft: 8 }}
                                >
                                    {justAdded ? "Added to cart!" : null}
                                </span>
                            </div>
                        )}
                    </section>
                </div>

                <section className={styles.detailPanel}>
                    <h3 className={styles.detailTitle}>PRODUCT DETAIL</h3>
                    <p className={styles.detailText}>{product?.description}</p>
                </section>
            </div>

            {state && isValidObjectId(orderId) && (
                <ReviewForm productId={state.productId} orderId={orderId} />
            )}
            <ReviewList productId={routeProductId} />
        </>
    );
}
