import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./ProductDetail.module.scss";
import { apiUtils } from "../../utils/newRequest";
import { getImageUrl } from "../../utils/imageUrl";
import { Link } from "react-router-dom";

export default function ProductDetail({ onAddToCart }) {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    const dec = () => setQty((q) => Math.max(1, q - 1));
    const inc = () => setQty((q) => q + 1);

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

    const addToCartLocal = (payload) => {
        const KEY = "cart";
        let cart = [];
        try {
            cart = JSON.parse(localStorage.getItem(KEY)) || [];
        } catch (e) {
            console.log(e);
        }
        const i = cart.findIndex((x) => x.productId === payload.productId);
        if (i >= 0) cart[i].qty += payload.qty;
        else cart.push(payload);
        localStorage.setItem(KEY, JSON.stringify(cart));
        window.dispatchEvent(
            new CustomEvent("cart:updated", { detail: { cart } })
        );
    };

    const handleAddToCart = async () => {
        if (!product || adding) return;
        setAdding(true);
        try {
            const payload = {
                productId: productId,
                name: product.name || product.title,
                price: product.price,
                qty,
                image: product.images?.[0] || product.thumbnail,
            };
            if (typeof onAddToCart === "function") onAddToCart(payload);
            else addToCartLocal(payload);

            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 1600);
        } finally {
            setAdding(false);
        }
    };

    // Form state
    // const [rating, setRating] = useState(5);
    // const [comment, setComment] = useState("");

    // const submitNew = (e) => {
    //   e.preventDefault();
    //   if (!comment.trim()) return;
    //   setReviews((prev) => [
    //     {
    //       _id: "mock-" + (prev.length + 1),
    //       name: "You",
    //       createdAt: new Date().toISOString(),
    //       rating,
    //       comment: comment.trim(),
    //     },
    //     ...prev,
    //   ]);
    //   setComment("");
    //   setRating(5);
    // };

    // const Stars = ({ value, onChange, readOnly = false }) => (
    //   <div className="d-flex align-items-center gap-1">
    //     {[1, 2, 3, 4, 5].map((n) => (
    //       <button
    //         key={n}
    //         type="button"
    //         className={"btn btn-sm " + (n <= value ? "btn-warning" : "btn-outline-secondary")}
    //         style={{ lineHeight: 1, borderRadius: 999 }}
    //         onClick={readOnly ? undefined : () => onChange?.(n)}
    //         disabled={readOnly}
    //         aria-label={readOnly ? undefined : `Rate ${n} star${n > 1 ? "s" : ""}`}
    //       >
    //         ★
    //       </button>
    //     ))}
    //   </div>
    // );

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

                            <button type="button" className={styles.chatBtn}>
                                Chat with shop
                            </button>
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

                            <button type="button" className={styles.buyNow}>
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

            {/* <div className={"container py-4 " + styles["reviews-page"]}>
        <h2 className="mb-4 text-uppercase fw-bold">Product Feedback</h2>

        <form className={"card border-0 shadow-sm p-3 mb-4 rounded-4 " + styles["rounded-4"]} onSubmit={submitNew}>
          <div className="d-flex gap-3">
            <div className="rounded-circle bg-secondary flex-shrink-0" style={{ width: 48, height: 48 }} aria-hidden />
            <div className="flex-grow-1">
              <div className="mb-2">
                <Stars value={rating} onChange={setRating} />
              </div>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Write your review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              <div className="text-end mt-3">
                <button className="btn btn-primary px-4">Submit review</button>
              </div>
            </div>
          </div>
        </form>

        <div className="vstack gap-4">
          {reviews.map((r) => (
            <div key={r._id} className="pb-4 border-bottom">
              <div className="d-flex gap-3 align-items-start">
                <div className="rounded-circle bg-secondary flex-shrink-0" style={{ width: 48, height: 48 }} aria-hidden />
                <div className="flex-grow-1">
                  <div className="text-muted small" style={{ marginTop: 2 }}>
                    <div style={{ fontWeight: 600, color: "#343a40" }}>{r.name}</div>
                    <div>{new Date(r.createdAt).toLocaleDateString("vi-VN")}</div>
                  </div>
                  <div className="mt-2" style={{ color: "#4a4a4a" }}>{r.comment}</div>
                  <div className="mt-3"><Stars value={r.rating} readOnly /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}
        </>
    );
}
