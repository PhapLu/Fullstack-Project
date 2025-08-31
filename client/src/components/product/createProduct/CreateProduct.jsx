// Imports
import { useEffect, useRef, useState } from "react";
import styles from "../../../pages/profile/vendorProfile/VendorProfile.module.scss";

const steps = [
    { key: "product", label: "Product Information" },
    { key: "pricing", label: "Pricing Information" },
    { key: "review", label: "Review" },
];

const MAX_IMAGES = 10;
const MAX_IMAGE_MB = 15;

export default function CreateProduct({ onCancel, onDone }) {
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [inputs, setInputs] = useState({
        name: "",
        description: "",
        type: "",
        images: [], // [{ id, url, _objectUrl }]
        pricingModel: "Standard pricing",
        price: "", // keep as string for UX while typing
        currency: "USD",
        pricingDesc: "",
    });

    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    const isNumberLike = (v) => v !== "" && Number.isFinite(Number(String(v).replace(",", ".")));

    const validateStep = (curStep, data = inputs) => {
        const next = {};
        if (curStep === 0) {
            if (!data.name?.trim()) next.name = "Product name is required.";
            if (!data.description?.trim())
                next.description = "Description is required.";
            if (!data.type?.trim()) next.type = "Product type is required.";
            if (!data.images?.length)
                next.images = "At least 1 image is required.";
            if ((data.images?.length || 0) > MAX_IMAGES)
                next.images = `Up to ${MAX_IMAGES} images allowed.`;
        }
        if (curStep === 1) {
            if (!isNumberLike(data.price))
                next.price = "Price must be a valid number.";
        }
        return next;
    };

    const validateAll = (data = inputs) => ({
        ...validateStep(0, data),
        ...validateStep(1, data),
    });

    useEffect(() => {
        return () => {
            inputs.images?.forEach(
                (img) => img?._objectUrl && URL.revokeObjectURL(img.url)
            );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const transforms = {
        // strip non-numeric chars while typing, but keep string
        price: (v) => v.replace(/[^\d.,-]/g, ""),
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const raw = type === "checkbox" ? checked : value;
        const nextVal = transforms[name] ? transforms[name](raw) : raw;

        setInputs((prev) => ({ ...prev, [name]: nextVal }));
        setErrors((prev) => ({ ...prev, [name]: "" })); // clear field error on edit
    };

    const blurNormalizers = {
        price: (v) => v.replace(",", "."),
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const norm = blurNormalizers[name]?.(value);
        if (norm !== undefined) {
            setInputs((prev) => ({ ...prev, [name]: norm }));
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target?.files || []);
        if (!files.length) return;

        setInputs((prev) => {
            const remain = Math.max(0, MAX_IMAGES - prev.images.length);
            const take = files.slice(0, remain);

            const oversize = take.find(
                (f) => f.size > MAX_IMAGE_MB * 1024 * 1024
            );
            if (oversize) {
                setErrors((p) => ({
                    ...p,
                    images: `Each image must be ≤ ${MAX_IMAGE_MB}MB.`,
                }));
                return prev;
            }

            const newItems = take.map((file, idx) => ({
                id: `${Date.now()}_${idx}`,
                url: URL.createObjectURL(file),
                _objectUrl: true,
            }));
            setErrors((p) => ({ ...p, images: "" }));
            return { ...prev, images: [...prev.images, ...newItems] };
        });

        e.target.value = ""; // allow reselecting same files
    };

    const onDropImages = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer?.files || []);
        if (!files.length) return;

        setInputs((prev) => {
            const remain = Math.max(0, MAX_IMAGES - prev.images.length);
            const take = files.slice(0, remain);

            const oversize = take.find(
                (f) => f.size > MAX_IMAGE_MB * 1024 * 1024
            );
            if (oversize) {
                setErrors((p) => ({
                    ...p,
                    images: `Each image must be ≤ ${MAX_IMAGE_MB}MB.`,
                }));
                return prev;
            }

            const newItems = take.map((file, idx) => ({
                id: `${Date.now()}_${idx}`,
                url: URL.createObjectURL(file),
                _objectUrl: true,
            }));
            setErrors((p) => ({ ...p, images: "" }));
            return { ...prev, images: [...prev.images, ...newItems] };
        });
    };

    const removeImage = (idx) => {
        setInputs((prev) => {
            const item = prev.images[idx];
            if (item?._objectUrl) URL.revokeObjectURL(item.url);
            return { ...prev, images: prev.images.filter((_, i) => i !== idx) };
        });
    };

    const handleNext = () => {
        const stepErrs = validateStep(step);
        if (Object.keys(stepErrs).length) {
            setErrors((prev) => ({ ...prev, ...stepErrs }));
            return;
        }
        setStep((s) => Math.min(s + 1, steps.length - 1));
    };

    const handleBack = () => setStep((s) => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        setIsSubmitting(true);

        const allErrs = validateAll();
        if (Object.keys(allErrs).length) {
            setErrors((prev) => ({ ...prev, ...allErrs }));
            if (
                allErrs.name ||
                allErrs.description ||
                allErrs.type ||
                allErrs.images
            )
                setStep(0);
            else if (allErrs.price) setStep(1);
            setIsSubmitting(false);
            return;
        }

        // normalize only here so typing stays smooth
        const payload = {
            ...inputs,
            price:
                inputs.price === ""
                    ? ""
                    : Number(String(inputs.price).replace(",", ".")),
        };

        try {
            await onDone?.(payload);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 style={{ textAlign: "center", margin: "8px 0 16px" }}>
                NEW PRODUCT
            </h2>

            <div className={styles.wizard}>
                <div className={styles["wizard-shell"]}>
                    {/* Sidebar */}
                    <aside className={styles["wizard-sidebar"]}>
                        <ul>
                            {steps.map((s, i) => {
                                const done = i < step;
                                const active = i === step;
                                return (
                                    <li
                                        key={s.key}
                                        className={`${styles["wiz-step"]} ${
                                            active ? styles.active : ""
                                        } ${done ? styles.done : ""}`}
                                    >
                                        <span className="check">
                                            {done ? "✓" : i + 1}
                                        </span>
                                        {s.label}
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>

                    {/* Panel */}
                    <section className={styles["wizard-panel"]}>
                        {/* Step 0: Product */}
                        {step === 0 && (
                            <>
                                <div className={styles["panel-title"]}>
                                    PRODUCT INFORMATION
                                </div>

                                <label className={styles["f-label"]}>
                                    Product Name{" "}
                                    <span className={styles.req}>*</span>
                                </label>
                                <input
                                    name="name"
                                    className={`${styles["f-input"]} ${
                                        errors.name ? styles.invalid : ""
                                    }`}
                                    value={inputs.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                {errors.name && (
                                    <div className={styles.error}>
                                        {errors.name}
                                    </div>
                                )}

                                <label
                                    className={styles["f-label"]}
                                    style={{ marginTop: 14 }}
                                >
                                    Images <span className={styles.req}>*</span>
                                    <span className={styles.helper}>
                                        &nbsp;({inputs.images.length}/
                                        {MAX_IMAGES})
                                    </span>
                                </label>

                                <div
                                    className={styles["image-grid"]}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={onDropImages}
                                >
                                    {inputs.images.map((it, idx) => (
                                        <div
                                            key={it.id}
                                            className={styles["image-cell"]}
                                        >
                                            <img
                                                className={styles["card-img"]}
                                                src={it.url}
                                                alt={`img-${idx + 1}`}
                                            />
                                            <button
                                                type="button"
                                                className={styles["delete-btn"]}
                                                onClick={() => removeImage(idx)}
                                                title="Remove"
                                                aria-label={`Remove image ${
                                                    idx + 1
                                                }`}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        className={styles["icon-tile"]}
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={
                                            inputs.images.length >= MAX_IMAGES
                                        }
                                        title={
                                            inputs.images.length >= MAX_IMAGES
                                                ? "Reached limit"
                                                : "Add images"
                                        }
                                    >
                                        +
                                    </button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        hidden
                                        onChange={handleFileChange}
                                    />
                                </div>
                                {errors.images && (
                                    <div className={styles.error}>
                                        {errors.images}
                                    </div>
                                )}

                                <label
                                    className={styles["f-label"]}
                                    style={{ marginTop: 14 }}
                                >
                                    Description{" "}
                                    <span className={styles.req}>*</span>
                                </label>
                                <textarea
                                    name="description"
                                    className={`${styles["f-textarea"]} ${
                                        errors.description ? styles.invalid : ""
                                    }`}
                                    value={inputs.description}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                {errors.description && (
                                    <div className={styles.error}>
                                        {errors.description}
                                    </div>
                                )}

                                <label
                                    className={styles["f-label"]}
                                    style={{ marginTop: 14 }}
                                >
                                    Product Type{" "}
                                    <span className={styles.req}>*</span>
                                </label>
                                <select
                                    name="type"
                                    className={`${styles["f-input"]} ${
                                        errors.type ? styles.invalid : ""
                                    }`}
                                    value={inputs.type}
                                    onChange={handleChange}
                                >
                                    <option value="">Select a type</option>
                                    <option>Beauty</option>
                                    <option>Fashion</option>
                                    <option>Electronics</option>
                                </select>
                                {errors.type && (
                                    <div className={styles.error}>
                                        {errors.type}
                                    </div>
                                )}

                                <div className={styles["wizard-actions"]}>
                                    <button
                                        className={`${styles.btn} ${styles.ghost}`}
                                        onClick={onCancel}
                                        type="button"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={styles.btn}
                                        onClick={handleNext}
                                        type="button"
                                    >
                                        Continue →
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 1: Pricing */}
                        {step === 1 && (
                            <>
                                <div className={styles["panel-title"]}>
                                    PRICING INFORMATION
                                </div>

                                <label className={styles["f-label"]}>
                                    Pricing Model
                                </label>
                                <select
                                    name="pricingModel"
                                    className={styles["f-input"]}
                                    value={inputs.pricingModel}
                                    onChange={handleChange}
                                >
                                    <option>Standard pricing</option>
                                    <option>Tiered pricing</option>
                                </select>

                                <label
                                    className={styles["f-label"]}
                                    style={{ marginTop: 14 }}
                                >
                                    Price <span className={styles.req}>*</span>
                                </label>
                                <div className={styles.row}>
                                    <input
                                        name="price"
                                        className={`${styles["f-input"]} ${
                                            errors.price ? styles.invalid : ""
                                        }`}
                                        value={inputs.price}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        type="text"
                                        inputMode="decimal"
                                    />
                                    <select
                                        name="currency"
                                        className={styles["f-input"]}
                                        style={{ maxWidth: 120 }}
                                        value={inputs.currency}
                                        onChange={handleChange}
                                    >
                                        <option>USD</option>
                                        <option>VND</option>
                                        <option>EUR</option>
                                    </select>
                                </div>
                                {errors.price && (
                                    <div className={styles.error}>
                                        {errors.price}
                                    </div>
                                )}

                                <label
                                    className={styles["f-label"]}
                                    style={{ marginTop: 14 }}
                                >
                                    Description{" "}
                                    <span className={styles.helper}>
                                        (optional)
                                    </span>
                                </label>
                                <textarea
                                    name="pricingDesc"
                                    className={styles["f-textarea"]}
                                    value={inputs.pricingDesc}
                                    onChange={handleChange}
                                    placeholder="Add details about your pricing (optional)"
                                />

                                <div className={styles["wizard-actions"]}>
                                    <button
                                        className={`${styles.btn} ${styles.ghost}`}
                                        onClick={handleBack}
                                        type="button"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        className={styles.btn}
                                        onClick={handleNext}
                                        type="button"
                                    >
                                        Continue →
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 2: Review */}
                        {step === 2 && (
                            <>
                                <div className={styles["panel-title"]}>
                                    PREVIEW
                                </div>

                                <div
                                    style={{
                                        textAlign: "center",
                                        margin: "12px 0 18px",
                                    }}
                                >
                                    {inputs.images[0]?.url ? (
                                        <img
                                            src={inputs.images[0].url}
                                            alt={inputs.name || "Product image"}
                                            style={{
                                                width: 260,
                                                height: 190,
                                                objectFit: "cover",
                                                borderRadius: 10,
                                                display: "block",
                                                margin: "0 auto",
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className={
                                                styles["image-placeholder"]
                                            }
                                            style={{
                                                width: 260,
                                                height: 190,
                                                margin: "0 auto",
                                                borderRadius: 10,
                                            }}
                                        />
                                    )}
                                    <div
                                        style={{
                                            marginTop: 10,
                                            color: "#6b7280",
                                        }}
                                    >
                                        {inputs.name || "Lorem Ipsum is simply"}
                                    </div>
                                </div>

                                <hr className={styles["review-table"]} />

                                <div className={styles.review}>
                                    <div className={styles["review-media"]}>
                                        {inputs.images.length ? (
                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "repeat(2, 1fr)",
                                                    gap: 8,
                                                    width: 220,
                                                    margin: "0 auto",
                                                }}
                                            >
                                                {inputs.images.map((it, i) => (
                                                    <img
                                                        key={it.id}
                                                        src={it.url}
                                                        alt={`Gallery image ${
                                                            i + 1
                                                        }`}
                                                        style={{
                                                            width: "100%",
                                                            height: 90,
                                                            objectFit: "cover",
                                                            borderRadius: 8,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div
                                                className={
                                                    styles["image-placeholder"]
                                                }
                                                style={{
                                                    width: 120,
                                                    height: 90,
                                                    margin: "0 auto",
                                                    borderRadius: 8,
                                                }}
                                            />
                                        )}
                                        <div className="caption">Gallery</div>
                                    </div>

                                    <div className={styles["review-table"]}>
                                        <div
                                            className={`${styles["review-row"]} ${styles.head}`}
                                        >
                                            Product Details
                                        </div>
                                        <div className={styles["review-row"]}>
                                            <strong>Product Name</strong>
                                            <div>{inputs.name || "—"}</div>
                                        </div>
                                        <div className={styles["review-row"]}>
                                            <strong>Product Description</strong>
                                            <div>
                                                {inputs.description || "—"}
                                            </div>
                                        </div>
                                        <div className={styles["review-row"]}>
                                            <strong>Product Type</strong>
                                            <div>{inputs.type || "—"}</div>
                                        </div>

                                        <div
                                            className={`${styles["review-row"]} ${styles.head}`}
                                            style={{ marginTop: 8 }}
                                        >
                                            Pricing Details
                                        </div>
                                        <div className={styles["review-row"]}>
                                            <strong>Pricing Model</strong>
                                            <div>{inputs.pricingModel}</div>
                                        </div>
                                        <div className={styles["review-row"]}>
                                            <strong>Price</strong>
                                            <div>
                                                {inputs.price
                                                    ? `${inputs.price} ${inputs.currency}`
                                                    : "—"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles["wizard-actions"]}>
                                    <button
                                        className={`${styles.btn} ${styles.ghost}`}
                                        onClick={handleBack}
                                        type="button"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        className={styles.btn}
                                        onClick={handleSubmit}
                                        type="button"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting
                                            ? "Adding…"
                                            : "Add Product"}
                                    </button>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
