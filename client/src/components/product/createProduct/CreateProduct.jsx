import React, {
    useCallback,
    useMemo,
    useRef,
    useState,
    useTransition,
} from "react";
import styles from "../../../pages/profile/vendorProfile/VendorProfile.module.scss";

const steps = [
    { key: "product", label: "Product Information" },
    { key: "pricing", label: "Pricing Information" },
    { key: "review", label: "Review" },
];

const MAX_IMAGES = 20;

export default function CreateProduct({ onCancel, onDone }) {
    const [step, setStep] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [attemptedNext, setAttemptedNext] = useState(false);
    const [touched, setTouched] = useState({});

    const [form, setForm] = useState({
        name: "",
        description: "",
        type: "",
        features: [""],
        unitLabel: "",
        images: [],
        pricingModel: "Standard pricing",
        price: "",
        currency: "USD",
        pricingDesc: "",
    });

    const markTouched = useCallback(
        (k) => setTouched((t) => ({ ...t, [k]: true })),
        []
    );

    const isNumberLike = (v) => v !== "" && Number.isFinite(Number(v));
    const buildErrorsFor = useCallback((curStep, data) => {
        const next = {};
        if (curStep === 0) {
            if (!data.name.trim()) next.name = "Product name is required.";
            if (!data.description.trim())
                next.description = "Description is required.";
            if (!data.type.trim()) next.type = "Product type is required.";
            if (data.images.length === 0)
                next.images = "At least 1 image is required.";
            if (data.images.length > MAX_IMAGES)
                next.images = `Up to ${MAX_IMAGES} images allowed.`;
        } else if (curStep === 1) {
            if (!isNumberLike(data.price))
                next.price = "Price must be a valid number.";
        }
        return next;
    }, []);

    const errors = useMemo(
        () => buildErrorsFor(step, form),
        [step, form, buildErrorsFor]
    );
    const canContinue = Object.keys(errors).length === 0;

    const fileInputRef = useRef(null);
    const openFilePicker = () => fileInputRef.current?.click();

    const pushFiles = (files) => {
        if (!files.length) return;
        setForm((f) => {
            const remain = Math.max(0, MAX_IMAGES - f.images.length);
            const take = files.slice(0, remain);
            const newItems = take.map((file, idx) => ({
                id: `${Date.now()}_${idx}`,
                url: URL.createObjectURL(file),
                _objectUrl: true,
            }));
            return { ...f, images: [...f.images, ...newItems] };
        });
    };

    const onPickImages = (e) => {
        const files = Array.from(e.target.files || []);
        pushFiles(files);
        setTouched((t) => ({ ...t, images: true }));
        e.target.value = "";
    };

    const onDropImages = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer?.files || []);
        pushFiles(files);
    };

    const removeImage = useCallback((i) => {
        setForm((f) => {
            const item = f.images[i];
            if (item?._objectUrl) URL.revokeObjectURL(item.url);
            return { ...f, images: f.images.filter((_, idx) => idx !== i) };
        });
    }, []);

    const setField = useCallback(
        (k, v) => setForm((prev) => ({ ...prev, [k]: v })),
        []
    );
    const showErr = useCallback(
        (k) => !!errors[k] && (touched[k] || attemptedNext),
        [errors, touched, attemptedNext]
    );

    const handleContinue = useCallback(() => {
        setAttemptedNext(true);
        if (!canContinue) {
            requestAnimationFrame(() => {
                const firstInvalid = document.querySelector(
                    `.${styles.invalid}`
                );
                if (firstInvalid && typeof firstInvalid.focus === "function")
                    firstInvalid.focus();
            });
            if (step === 0)
                setTouched((t) => ({
                    ...t,
                    name: true,
                    description: true,
                    type: true,
                    images: true,
                }));
            if (step === 1) setTouched((t) => ({ ...t, price: true }));
            return;
        }
        startTransition(() => setStep((s) => Math.min(s + 1, 2)));
    }, [canContinue, step, styles.invalid]);

    const handleBack = useCallback(() => {
        startTransition(() => setStep((s) => Math.max(s - 1, 0)));
    }, []);

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
                    <section
                        className={styles["wizard-panel"]}
                        aria-busy={isPending}
                    >
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
                                    className={`${styles["f-input"]} ${
                                        showErr("name") ? styles.invalid : ""
                                    }`}
                                    value={form.name}
                                    onChange={(e) =>
                                        setField("name", e.target.value)
                                    }
                                    onBlur={() => markTouched("name")}
                                    aria-invalid={!!showErr("name")}
                                />
                                {showErr("name") && (
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
                                        &nbsp;({form.images.length}/{MAX_IMAGES}
                                        )
                                    </span>
                                </label>

                                <div
                                    className={styles["image-grid"]}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={onDropImages}
                                >
                                    {form.images.map((it, idx) => (
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
                                            form.images.length >= MAX_IMAGES
                                        }
                                        title={
                                            form.images.length >= MAX_IMAGES
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
                                        onChange={onPickImages}
                                    />
                                </div>
                                {showErr("images") && (
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
                                    className={`${styles["f-textarea"]} ${
                                        showErr("description")
                                            ? styles.invalid
                                            : ""
                                    }`}
                                    value={form.description}
                                    onChange={(e) =>
                                        setField("description", e.target.value)
                                    }
                                    onBlur={() => markTouched("description")}
                                    aria-invalid={!!showErr("description")}
                                />
                                {showErr("description") && (
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
                                    className={`${styles["f-input"]} ${
                                        showErr("type") ? styles.invalid : ""
                                    }`}
                                    value={form.type}
                                    onChange={(e) =>
                                        setField("type", e.target.value)
                                    }
                                    onBlur={() => markTouched("type")}
                                    aria-invalid={!!showErr("type")}
                                >
                                    <option value="">Label</option>
                                    <option>Beauty</option>
                                    <option>Fashion</option>
                                    <option>Electronics</option>
                                </select>
                                {showErr("type") && (
                                    <div className={styles.error}>
                                        {errors.type}
                                    </div>
                                )}

                                <div className={styles["wizard-actions"]}>
                                    <button
                                        className={`${styles.btn} ${styles.ghost}`}
                                        onClick={onCancel}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={styles.btn}
                                        disabled={isPending}
                                        onClick={handleContinue}
                                    >
                                        {isPending ? "Loading…" : "Continue →"}
                                    </button>
                                </div>
                            </>
                        )}

                        {step === 1 && (
                            <>
                                <div className={styles["panel-title"]}>
                                    PRICING INFORMATION
                                </div>

                                <label className={styles["f-label"]}>
                                    Pricing Model
                                </label>
                                <select
                                    className={styles["f-input"]}
                                    value={form.pricingModel}
                                    onChange={(e) =>
                                        setField("pricingModel", e.target.value)
                                    }
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
                                        className={`${styles["f-input"]} ${
                                            showErr("price")
                                                ? styles.invalid
                                                : ""
                                        }`}
                                        value={form.price}
                                        onChange={(e) =>
                                            setField(
                                                "price",
                                                e.target.value.replace(
                                                    /[^\d.,-]/g,
                                                    ""
                                                )
                                            )
                                        }
                                        onBlur={(e) => {
                                            markTouched("price");
                                            const normalized =
                                                e.target.value.replace(
                                                    ",",
                                                    "."
                                                );
                                            setField("price", normalized);
                                        }}
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        min="0"
                                        aria-invalid={!!showErr("price")}
                                    />
                                    <select
                                        className={styles["f-input"]}
                                        style={{ maxWidth: 120 }}
                                        value={form.currency}
                                        onChange={(e) =>
                                            setField("currency", e.target.value)
                                        }
                                    >
                                        <option>USD</option>
                                        <option>VND</option>
                                        <option>EUR</option>
                                    </select>
                                </div>
                                {showErr("price") && (
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
                                    className={styles["f-textarea"]}
                                    value={form.pricingDesc}
                                    onChange={(e) =>
                                        setField("pricingDesc", e.target.value)
                                    }
                                    placeholder="Label"
                                />

                                <div className={styles["wizard-actions"]}>
                                    <button
                                        className={`${styles.btn} ${styles.ghost}`}
                                        onClick={handleBack}
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        className={styles.btn}
                                        disabled={!canContinue || isPending}
                                        onClick={handleContinue}
                                    >
                                        {isPending ? "Loading…" : "Continue →"}
                                    </button>
                                </div>
                            </>
                        )}

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
                                    {form.images[0]?.url ? (
                                        <img
                                            src={form.images[0].url}
                                            alt={form.name || "Product image"}
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
                                        {form.name || "Lorem Ipsum is simply"}
                                    </div>
                                </div>

                                <hr className={styles["review-table"]} />

                                <div className={styles.review}>
                                    <div className={styles["review-media"]}>
                                        {form.images.length ? (
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
                                                {form.images.map((it, i) => (
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
                                            <div>{form.name || "—"}</div>
                                        </div>
                                        <div className={styles["review-row"]}>
                                            <strong>Product Description</strong>
                                            <div>{form.description || "—"}</div>
                                        </div>
                                        <div className={styles["review-row"]}>
                                            <strong>Product Type</strong>
                                            <div>{form.type || "—"}</div>
                                        </div>

                                        <div
                                            className={`${styles["review-row"]} ${styles.head}`}
                                            style={{ marginTop: 8 }}
                                        >
                                            Pricing Details
                                        </div>
                                        <div className={styles["review-row"]}>
                                            <strong>Pricing Model</strong>
                                            <div>{form.pricingModel}</div>
                                        </div>
                                        <div className={styles["review-row"]}>
                                            <strong>Price</strong>
                                            <div>
                                                {form.price
                                                    ? `${form.price} ${form.currency}`
                                                    : "—"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles["wizard-actions"]}>
                                    <button
                                        className={`${styles.btn} ${styles.ghost}`}
                                        onClick={handleBack}
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        className={styles.btn}
                                        onClick={() => onDone?.(form)}
                                    >
                                        Add Product
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
