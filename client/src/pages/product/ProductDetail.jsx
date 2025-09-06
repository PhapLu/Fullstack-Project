import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import styles from "./ProductDetail.module.scss";
import { apiUtils } from "../../utils/newRequest";
import { getImageUrl } from "../../utils/imageUrl";
import { Link } from "react-router-dom";
import { useCart } from "../../store/cart/CartContext";
import ReviewForm from "./components/ReviewForm";
import ReviewList from "./components/ReviewList";
import { buildCheckoutPayload, startCheckout } from "../../utils/checkoutState";

export default function ProductDetail({ onAddToCart }) {
    const location = useLocation()
    const state = location.state || {};
    const navigate = useNavigate();

    const { addItem } = useCart()
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const [justAdded, setJustAdded] = useState(false);
    const orderId = state.orderId;
    console.log(state)

    const dec = () => setQty((q) => Math.max(1, q - 1));
    const inc = () => setQty((q) => q + 1);
    const pid = product?._id;

    useEffect(() => {
        const fecthProduct = async () => {
            try {
                setLoading(true);
                const res = await apiUtils.get(`/product/readProduct/${productId}`);
                setProduct(res.data.metadata.product);
            } catch (e) {
                if (e.name !== "AbortError") setError(e);
            } finally {
                setLoading(false);
            }
        }
        fecthProduct();
    }, [productId]);

    const handleAddToCart = async () => {
        if (!product || adding) return;
        setAdding(true);
        try {
            await addItem({
                id: productId,
                name: product.title || product.name,
                price: product.price,
                image: getImageUrl(product.images?.[0] || product.thumbnail),
                stock: product.stock,            // if you have it
                classification: product.variant, // if applicable
                qty,
            });
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 1600);
        } finally {
            setAdding(false);
        }
    };
    // Helper: kiểm tra ObjectId 24 hex
    const isValidObjectId = (v) => /^[a-f\d]{24}$/i.test(String(v || ""));

    const handleBuyNow = async () => {
        if (!product) return;
      
        // Build one-item payload consistent with Cart payload
        const oneItem = {
            id: productId,
            qty,
            price: product.price,
            name: product.title || product.name,
            image: getImageUrl(product?.images?.[0] || product?.thumbnail),
        };
      
        const payload = buildCheckoutPayload({
            items: [oneItem],
            currency: "USD",
        });
      
        await startCheckout(navigate, payload);
    };

    return (
        <>
            <div className={styles.page}>
                <div className={styles.layout}>
                    {/* Left: Gallery */}
                    <section className={styles.gallery} aria-label="Product gallery">
                        <div className={styles.hero} aria-hidden="true">
                            {product?.images?.[0] && (
                            <img
                                src={getImageUrl(product.images[0])}
                                alt={product?.title || "Product image"}
                            />
                            )}
                        </div>

                        <div className={styles.thumbs}>
                            {product?.images?.map((img, i) => (
                            <button type="button" key={i} className={styles.thumb}>
                                <img src={getImageUrl(img)} alt={`Thumbnail ${i + 1}`} />
                            </button>
                            ))}
                        </div>
                    </section>


                    {/* Right: Info */}
                    <section className={styles.info}>
                        {/* Seller row */}
                        <div className={styles.sellerRow}>
                            <div className={styles.sellerLeft}>
                                <div className={styles.avatar} aria-hidden >
                                    <img src={getImageUrl(product?.vendorId?.avatar)}/>
                                </div>
                                <div className={styles.sellerMeta}>
                                    <div className={styles.sellerName}>
                                        {product?.vendorId?.vendorProfile?.businessName}
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

                        {/* Title */}
                        <h1 className={styles.title}>
                            {product?.title}
                        </h1>

                        {/* Price box */}
                        <div className={styles.field}>
                            <div
                                id="price"
                                className={styles.price}
                            >
                                ${product?.price}
                            </div>
                        </div>

                        {/* Delivery row */}
                        <div className={styles.deliveryRow}>
                            <span className={styles.deliveryLabel}>
                                Delivery on:
                            </span>
                            <span className={styles.deliveryIcon} aria-hidden>
                                {/* Truck icon (inline SVG) */}
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

                        {/* Amount row */}
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

                        {/* Actions */}
                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.addToCart}
                                onClick={handleAddToCart}
                                disabled={loading || !product || adding}
                            >
                                <span className={styles.cartIcon} aria-hidden>
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

                            <button type="button" onClick={handleBuyNow} disabled={loading || !product} className={styles.buyNow}>
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
                    </section>
                </div>

                {/* Product detail section */}
                <section className={styles.detailPanel}>
                    <h3 className={styles.detailTitle}>PRODUCT DETAIL</h3>
                    <p className={styles.detailText}>
                        {product?.description}
                    </p>
                </section>
            </div>

            {/* Review */}
            {state && isValidObjectId(orderId) && (
                <ReviewForm productId={state.productId} orderId={orderId} />
            )}
            <ReviewList productId={productId} />
        </>
    );
}
