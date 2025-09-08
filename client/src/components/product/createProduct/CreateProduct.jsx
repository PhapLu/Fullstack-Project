// Imports
import { useEffect, useRef, useState } from "react";
import styles from "../../../pages/profile/vendorProfile/VendorProfile.module.scss";
import { apiUtils } from "../../../utils/newRequest"; // <-- use this here

const MAX_IMAGES = 10;
const MAX_IMAGE_MB = 15;

export default function CreateProduct({ onCancel, onDone }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inputs, setInputs] = useState({
        title: "",
        description: "",
        price: "",
        stock: "",
        images: [], // [{ id, file, previewUrl, _preview }]
        status: "active",
    });
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    const toNumber = (v) => Number(String(v).replace(",", "."));
    const isNumberLike = (v) => v !== "" && Number.isFinite(toNumber(v));

    const validate = (data = inputs) => {
        const next = {};

        // Title: 10–20 characters
        if (!data.title?.trim()) {
            next.title = "Product title is required.";
        } else if (
            data.title.trim().length < 10 ||
            data.title.trim().length > 20
        ) {
            next.title = "Title must be between 10 and 20 characters.";
        }

        // Description: required, ≤500 chars
        if (!data.description?.trim()) {
            next.description = "Description is required.";
        } else if (data.description.trim().length > 500) {
            next.description = "Description must be at most 500 characters.";
        }

        // Images: at least 1 required (max already handled by MAX_IMAGES)
        if (!data.images?.length) {
            next.images = "At least 1 image is required.";
        } else if ((data.images?.length || 0) > MAX_IMAGES) {
            next.images = `Up to ${MAX_IMAGES} images allowed.`;
        }

        // Price: required, positive number
        if (!isNumberLike(data.price)) {
            next.price = "Price must be a valid number.";
        } else if (toNumber(data.price) <= 0) {
            next.price = "Price must be greater than 0.";
        }

        // Stock: required, integer ≥ 0
        if (!isNumberLike(data.stock)) {
            next.stock = "Stock must be a valid number.";
        } else if (!Number.isInteger(toNumber(data.stock))) {
            next.stock = "Stock must be an integer.";
        } else if (toNumber(data.stock) < 0) {
            next.stock = "Stock cannot be negative.";
        }

        // Status: must be active|inactive
        if (!["active", "inactive"].includes(data.status)) {
            next.status = "Invalid status.";
        }

        return next;
    };

    useEffect(() => {
        return () => {
            inputs.images?.forEach(
                (img) => img?._preview && URL.revokeObjectURL(img.previewUrl)
            );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs((p) => ({ ...p, [name]: value }));
        setErrors((p) => ({ ...p, [name]: "" }));
    };

    const handleNumberBlur = (e) => {
        const { name, value } = e.target;
        setInputs((p) => ({ ...p, [name]: String(value).replace(",", ".") }));
    };

    const pushFiles = (files) => {
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

            const now = Date.now();
            const newItems = take.map((file, idx) => ({
                id: `${now}_${idx}`,
                file,
                previewUrl: URL.createObjectURL(file),
                _preview: true,
            }));
            setErrors((p) => ({ ...p, images: "" }));
            return { ...prev, images: [...prev.images, ...newItems] };
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target?.files || []);
        if (!files.length) return;
        pushFiles(files);
        e.target.value = "";
    };

    const onDropImages = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer?.files || []);
        if (!files.length) return;
        pushFiles(files);
    };

    const removeImage = (idx) => {
        setInputs((prev) => {
            const item = prev.images[idx];
            if (item?._preview) URL.revokeObjectURL(item.previewUrl);
            return { ...prev, images: prev.images.filter((_, i) => i !== idx) };
        });
    };

    const buildFormData = () => {
        const fd = new FormData();
        fd.append("title", inputs.title.trim());
        fd.append("description", inputs.description.trim());
        fd.append("price", String(toNumber(inputs.price)));
        fd.append("stock", String(Math.trunc(toNumber(inputs.stock))));
        fd.append("status", inputs.status);
        inputs.images.forEach((it) => it?.file && fd.append("files", it.file)); // multer field: "images"
        return fd;
    };

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        setIsSubmitting(true);

        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors((p) => ({ ...p, ...errs }));
            setIsSubmitting(false);
            return;
        }

        try {
            const formData = buildFormData();

            const response = await apiUtils.post(
                "/product/createProduct",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" }, // axios will set boundary for you; safe to include or omit
                }
            );

            // Shape: prefer created product object
            const created = response?.data?.metadata?.product;

            // Notify parent if provided (so it can prepend + close)
            onDone?.(created);
        } catch (err) {
            console.error("Create product failed:", err);
            setErrors((p) => ({
                ...p,
                submit:
                    err?.response?.data?.message || "Failed to create product.",
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className={styles.container} onSubmit={handleSubmit}>
            <h2 style={{ textAlign: "center", margin: "8px 0 16px" }}>
                Create Product
            </h2>

            <label className={styles["panel-title"]}>
                Title <span className={styles.req}>*</span>
            </label>
            <input
                name="title"
                className={`${styles["f-input"]} ${
                    errors.title ? styles.invalid : ""
                }`}
                value={inputs.title}
                onChange={handleChange}
            />
            {errors.title && <div className={styles.error}>{errors.title}</div>}

            <label className={styles["panel-title"]} style={{ marginTop: 14 }}>
                Description <span className={styles.req}>*</span>
            </label>
            <textarea
                name="description"
                className={`${styles["f-textarea"]} ${
                    errors.description ? styles.invalid : ""
                }`}
                value={inputs.description}
                onChange={handleChange}
            />
            {errors.description && (
                <div className={styles.error}>{errors.description}</div>
            )}

            <label className={styles["panel-title"]} style={{ marginTop: 14 }}>
                Status
            </label>
            <select
                name="status"
                className={styles["f-input"]}
                value={inputs.status}
                onChange={handleChange}
            >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
            {errors.status && (
                <div className={styles.error}>{errors.status}</div>
            )}

            <div className={styles["panel-title"]} style={{ marginTop: 18 }}>
                MEDIA
            </div>
            <label className={styles["f-label"]}>
                Images <span className={styles.req}>*</span>
                <span className={styles.helper}>
                    &nbsp;({inputs.images.length}/{MAX_IMAGES})
                </span>
            </label>

            <div
                className={styles["image-grid"]}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDropImages}
            >
                {inputs.images.map((it, idx) => (
                    <div key={it.id} className={styles["image-cell"]}>
                        <img
                            className={styles["card-img"]}
                            src={it.previewUrl}
                            alt={`img-${idx + 1}`}
                        />
                        <button
                            type="button"
                            className={styles["delete-btn"]}
                            onClick={() => removeImage(idx)}
                            title="Remove"
                            aria-label={`Remove image ${idx + 1}`}
                        >
                            ✕
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    className={styles["icon-tile"]}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={inputs.images.length >= MAX_IMAGES}
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
                <div className={styles.error}>{errors.images}</div>
            )}

            <div className={styles["panel-title"]} style={{ marginTop: 18 }}>
                PRICE & STOCK
            </div>

            <label className={styles["f-label"]}>
                Price <span className={styles.req}>*</span>
            </label>
            <input
                name="price"
                className={`${styles["f-input"]} ${
                    errors.price ? styles.invalid : ""
                }`}
                value={inputs.price}
                onChange={handleChange}
                onBlur={handleNumberBlur}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
            />
            {errors.price && <div className={styles.error}>{errors.price}</div>}

            <label className={styles["f-label"]} style={{ marginTop: 14 }}>
                Stock <span className={styles.req}>*</span>
            </label>
            <input
                name="stock"
                className={`${styles["f-input"]} ${
                    errors.stock ? styles.invalid : ""
                }`}
                value={inputs.stock}
                onChange={handleChange}
                onBlur={handleNumberBlur}
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
            />
            {errors.stock && <div className={styles.error}>{errors.stock}</div>}

            {errors.submit && (
                <div className={styles.error} style={{ marginTop: 10 }}>
                    {errors.submit}
                </div>
            )}

            <div className={styles["wizard-actions"]} style={{ marginTop: 18 }}>
                <button
                    className={`${styles.btn} ${styles.ghost}`}
                    type="button"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    className={styles.btn}
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Adding…" : "Add Product"}
                </button>
            </div>
        </form>
    );
}
