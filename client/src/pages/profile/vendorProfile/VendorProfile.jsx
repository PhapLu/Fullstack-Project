import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import styles from "./VendorProfile.module.scss";

/* ================== Seed demo products ================== */
const seedProducts = [
  { title: "Blue", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "Keyboard", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "Women Outfit", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "New Collection", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "Headphone 50 Hrs", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "Voucher Pack", desc: "Lorem Ipsum is simply dummy text of the printing" },
];

/* ================== Avatar ================== */
function Avatar({ url, onSaveImage }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [imgSrc, setImgSrc] = useState(url || "");

  useEffect(() => setImgSrc(url || ""), [url]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pick = () => inputRef.current?.click();
  const onChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const blob = URL.createObjectURL(f);
    setPreview(blob);
    e.target.value = "";
  };

  const save = () => {
    if (!preview) return;
    setImgSrc(preview);
    onSaveImage?.(preview);
    setPreview(null);
  };

  const cancel = () => setPreview(null);
  const showUrl = preview ?? imgSrc;

  return (
    <div className={styles["avatar-wrap"]}>
      <div className={styles.avatar}>
        {showUrl ? (
          <img src={showUrl} alt="Avatar" className={styles["avatar-img"]} />
        ) : (
          <svg viewBox="0 0 512 512" width="120" height="120" aria-hidden>
            <circle cx="256" cy="171" r="96" stroke="#6d28d9" strokeWidth="28" fill="none" />
            <path d="M96 428c0-72 72-118 160-118s160 46 160 118" stroke="#6d28d9" strokeWidth="28" strokeLinecap="round" fill="none" />
          </svg>
        )}
      </div>

      <button className={`${styles["icon-btn"]} ${styles["avatar-edit"]}`} onClick={pick} title="Edit">✎</button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onChange} />

      {preview && (
        <div className={styles["avatar-actions"]}>
          <button className={`${styles.btn} ${styles.ghost}`} onClick={cancel}>Cancel</button>
          <button className={styles.btn} onClick={save}>Save</button>
        </div>
      )}
    </div>
  );
}

/* ================== Product Card ================== */
function ProductCard({ p, onDelete }) {
  return (
    <article className={styles.card}>
      <div className={`${styles["card-media"]} ${p.image ? styles["has-img"] : ""}`}>
        {p.image ? (
          <img className={styles["card-img"]} src={p.image} alt={p.title} />
        ) : (
          <span className={styles["media-badge"]}>{p.title}</span>
        )}
        <button className={styles["delete-btn"]} onClick={onDelete} title="Delete">✕</button>
      </div>
      <div className={styles["card-body"]}>
        <div className={styles.title}>{p.title}</div>
        <p className={styles.desc}>{p.desc}</p>
        <a className={styles.rating} href="#rating">Rating →</a>
      </div>
    </article>
  );
}

/* ================== Wizard Add Product ================== */
const steps = [
  { key: "product", label: "Product Information" },
  { key: "pricing", label: "Pricing Information" },
  { key: "review",  label: "Review" },
];

const MAX_IMAGES = 20;

function NewProduct({ onCancel, onDone }) {
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

  const markTouched = useCallback((k) => {
    setTouched((t) => ({ ...t, [k]: true }));
  }, []);

  /* ---------- Validate helpers ---------- */
  const isNumberLike = (v) => v !== "" && Number.isFinite(Number(v));
  const buildErrorsFor = useCallback((curStep, data) => {
    const next = {};
    if (curStep === 0) {
      if (!data.name.trim()) next.name = "Product name is required.";
      if (!data.description.trim()) next.description = "Description is required.";
      if (!data.type.trim()) next.type = "Product type is required.";
      if (data.images.length === 0) next.images = "At least 1 image is required.";
      if (data.images.length > MAX_IMAGES) next.images = `Up to ${MAX_IMAGES} images allowed.`;
    } else if (curStep === 1) {
      if (!isNumberLike(data.price)) next.price = "Price must be a valid number.";
    }
    return next;
  }, []);

  // 👉 errors luôn “đồng bộ” với form + step hiện tại
  const errors = useMemo(() => buildErrorsFor(step, form), [step, form, buildErrorsFor]);
  const canContinue = Object.keys(errors).length === 0;

  /* ---------- Images ---------- */
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

  /* ---------- Field helpers ---------- */
  const setField = useCallback((k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  }, []);

  const showErr = useCallback(
    (k) => !!errors[k] && (touched[k] || attemptedNext),
    [errors, touched, attemptedNext]
  );

  /* ---------- Next/Back ---------- */
  const handleContinue = useCallback(() => {
    setAttemptedNext(true);
    if (!canContinue) {
      requestAnimationFrame(() => {
        // focus vào field đầu tiên đang invalid (nếu có)
        const firstInvalid = document.querySelector(`.${styles.invalid}`);
        if (firstInvalid && typeof firstInvalid.focus === "function") firstInvalid.focus();
      });
      // đánh dấu touched cho step hiện tại để show lỗi
      if (step === 0)
        setTouched((t) => ({ ...t, name: true, description: true, type: true, images: true }));
      if (step === 1) setTouched((t) => ({ ...t, price: true }));
      return;
    }
    startTransition(() => setStep((s) => Math.min(s + 1, 2)));
  }, [canContinue, step]);

  const handleBack = useCallback(() => {
    startTransition(() => setStep((s) => Math.max(s - 1, 0)));
  }, []);

  return (
    <div className={styles.container}>
      <h2 style={{ textAlign: "center", margin: "8px 0 16px" }}>NEW PRODUCT</h2>

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
                    className={`${styles["wiz-step"]} ${active ? styles.active : ""} ${done ? styles.done : ""}`}
                  >
                    <span className="check">{done ? "✓" : i + 1}</span>
                    {s.label}
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Panel */}
          <section className={styles["wizard-panel"]} aria-busy={isPending}>
            {step === 0 && (
              <>
                <div className={styles["panel-title"]}>PRODUCT INFORMATION</div>

                <label className={styles["f-label"]}>
                  Product Name <span className={styles.req}>*</span>
                </label>
                <input
                  className={`${styles["f-input"]} ${showErr("name") ? styles.invalid : ""}`}
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  onBlur={() => markTouched("name")}
                  aria-invalid={!!showErr("name")}
                />
                {showErr("name") && <div className={styles.error}>{errors.name}</div>}

                <label className={styles["f-label"]} style={{ marginTop: 14 }}>
                  Images <span className={styles.req}>*</span>
                  <span className={styles.helper}>&nbsp;({form.images.length}/{MAX_IMAGES})</span>
                </label>

                <div
                  className={styles["image-grid"]}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDropImages}
                >
                  {form.images.map((it, idx) => (
                    <div key={it.id} className={styles["image-cell"]}>
                      <img className={styles["card-img"]} src={it.url} alt={`img-${idx + 1}`} />
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
                    onClick={openFilePicker}
                    disabled={form.images.length >= MAX_IMAGES}
                    title={form.images.length >= MAX_IMAGES ? "Reached limit" : "Add images"}
                  >
                    +
                  </button>

                  {/* hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={onPickImages}
                  />
                </div>
                {showErr("images") && <div className={styles.error}>{errors.images}</div>}

                <label className={styles["f-label"]} style={{ marginTop: 14 }}>
                  Description <span className={styles.req}>*</span>
                </label>
                <textarea
                  className={`${styles["f-textarea"]} ${showErr("description") ? styles.invalid : ""}`}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  onBlur={() => markTouched("description")}
                  aria-invalid={!!showErr("description")}
                />
                {showErr("description") && <div className={styles.error}>{errors.description}</div>}

                <label className={styles["f-label"]} style={{ marginTop: 14 }}>
                  Product Type <span className={styles.req}>*</span>
                </label>
                <select
                  className={`${styles["f-input"]} ${showErr("type") ? styles.invalid : ""}`}
                  value={form.type}
                  onChange={(e) => setField("type", e.target.value)}
                  onBlur={() => markTouched("type")}
                  aria-invalid={!!showErr("type")}
                >
                  <option value="">Label</option>
                  <option>Beauty</option>
                  <option>Fashion</option>
                  <option>Electronics</option>
                </select>
                {showErr("type") && <div className={styles.error}>{errors.type}</div>}

                <div className={styles["wizard-actions"]}>
                  <button className={`${styles.btn} ${styles.ghost}`} onClick={onCancel}>
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
                <div className={styles["panel-title"]}>PRICING INFORMATION</div>

                <label className={styles["f-label"]}>Pricing Model</label>
                <select
                  className={styles["f-input"]}
                  value={form.pricingModel}
                  onChange={(e) => setField("pricingModel", e.target.value)}
                >
                  <option>Standard pricing</option>
                  <option>Tiered pricing</option>
                </select>

                <label className={styles["f-label"]} style={{ marginTop: 14 }}>
                  Price <span className={styles.req}>*</span>
                </label>
                <div className={styles.row}>
                  <input
                    className={`${styles["f-input"]} ${showErr("price") ? styles.invalid : ""}`}
                    value={form.price}
                    onChange={(e) =>
                      setField("price", e.target.value.replace(/[^\d.,-]/g, ""))
                    }
                    onBlur={(e) => {
                      markTouched("price");
                      const normalized = e.target.value.replace(",", ".");
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
                    onChange={(e) => setField("currency", e.target.value)}
                  >
                    <option>USD</option>
                    <option>VND</option>
                    <option>EUR</option>
                  </select>
                </div>
                {showErr("price") && <div className={styles.error}>{errors.price}</div>}

                <label className={styles["f-label"]} style={{ marginTop: 14 }}>
                  Description <span className={styles.helper}>(optional)</span>
                </label>
                <textarea
                  className={styles["f-textarea"]}
                  value={form.pricingDesc}
                  onChange={(e) => setField("pricingDesc", e.target.value)}
                  placeholder="Label"
                />

                <div className={styles["wizard-actions"]}>
                  <button className={`${styles.btn} ${styles.ghost}`} onClick={handleBack}>
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
                <div className={styles["panel-title"]}>PREVIEW</div>

                {/* Hero preview: dùng ảnh đầu tiên nếu có */}
                <div style={{ textAlign: "center", margin: "12px 0 18px" }}>
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
                      className={styles["image-placeholder"]}
                      style={{ width: 260, height: 190, margin: "0 auto", borderRadius: 10 }}
                    />
                  )}
                  <div style={{ marginTop: 10, color: "#6b7280" }}>
                    {form.name || "Lorem Ipsum is simply"}
                  </div>
                </div>

                <hr className={styles["review-table"]} />

                <div className={styles.review}>
                  {/* Gallery */}
                  <div className={styles["review-media"]}>
                    {form.images.length ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: 8,
                          width: 220,
                          margin: "0 auto",
                        }}
                      >
                        {form.images.map((it, i) => (
                          <img
                            key={it.id}
                            src={it.url}
                            alt={`Gallery image ${i + 1}`}
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
                        className={styles["image-placeholder"]}
                        style={{ width: 120, height: 90, margin: "0 auto", borderRadius: 8 }}
                      />
                    )}
                    <div className="caption">Gallery</div>
                  </div>

                  {/* Bảng thông tin */}
                  <div className={styles["review-table"]}>
                    <div className={`${styles["review-row"]} ${styles.head}`}>Product Details</div>
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

                    <div className={`${styles["review-row"]} ${styles.head}`} style={{ marginTop: 8 }}>
                      Pricing Details
                    </div>
                    <div className={styles["review-row"]}>
                      <strong>Pricing Model</strong>
                      <div>{form.pricingModel}</div>
                    </div>
                    <div className={styles["review-row"]}>
                      <strong>Price</strong>
                      <div>{form.price ? `${form.price} ${form.currency}` : "—"}</div>
                    </div>
                  </div>
                </div>

                <div className={styles["wizard-actions"]}>
                  <button className={`${styles.btn} ${styles.ghost}`} onClick={handleBack}>
                    ← Back
                  </button>
                  <button
                    className={styles.btn}
                    onClick={() => {
                      onDone?.(form);
                    }}
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

/* ================== Main ================== */
export default function VendorProfile() {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [tempCompanyName, setTempCompanyName] = useState(companyName);
  const [activeTab, setActiveTab] = useState("product");
  const [showWizard, setShowWizard] = useState(false);

  const [products, setProducts] = useState(() =>
    seedProducts.map((p, i) => ({
      id: `p_${i + 1}`,
      title: p.title,
      desc: p.desc,
      image: null,
    }))
  );
  const removeProduct = (id) =>
    setProducts((list) => list.filter((x) => x.id !== id));

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "ABC",
    lastName: "DEF",
    phone: "+84 123456789",
    industry: "beauty",
    country: "ABC",
    city: "DEF",
    district: "GHI",
    ward: "KLM",
    street: "123 NOQ street, KLM ward, GHI district, DEF city, ABC country",
    zip: "12345",
  });
  const [draft, setDraft] = useState(profile);

  const handleDraft = (e) => {
    const { name, value } = e.target;
    setDraft((p) => ({ ...p, [name]: value }));
  };
  const saveProfile = () => {
    setProfile(draft);
    setIsEditingProfile(false);
  };
  const cancelProfile = () => {
    setDraft(profile);
    setIsEditingProfile(false);
  };

  if (showWizard) {
    return (
      <NewProduct
        onCancel={() => setShowWizard(false)}
        onDone={(data) => {
          if (data?.name) {
            setProducts((arr) => [
              {
                id: `p_${Date.now()}`,
                title: data.name,
                desc: data.description || "—",
                image: data.images?.[0]?.url ?? null, // demo: dùng ảnh đầu tiên làm thumbnail
              },
              ...arr,
            ]);
          }
          setShowWizard(false);
        }}
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <section className={styles.profileHeader}>
        <Avatar url={avatarUrl} onSaveImage={setAvatarUrl} />
        <div className={styles.companyBlock}>
          <div className={styles["company-row"]}>
            <span className={styles["company-label"]}>Company Name:</span>
            {!isEditingCompany ? (
              <>
                <span className={styles["company-name"]}>
                  {companyName || <span className={styles.muted}> </span>}
                </span>
                <button
                  className={`${styles["icon-btn"]} ${styles["company-edit"]}`}
                  onClick={() => {
                    setTempCompanyName(companyName);
                    setIsEditingCompany(true);
                  }}
                  title="Edit company name"
                >
                  ✎
                </button>
              </>
            ) : (
              <div className={styles.companyEditBlock}>
                <input
                  className={styles["company-input"]}
                  value={tempCompanyName}
                  onChange={(e) => setTempCompanyName(e.target.value)}
                  placeholder="Company Name"
                />
                <div className={styles["company-actions"]}>
                  <button
                    className={`${styles.btn} ${styles.ghost}`}
                    onClick={() => setIsEditingCompany(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.btn}
                    onClick={() => {
                      setCompanyName((tempCompanyName || "").trim());
                      setIsEditingCompany(false);
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs + CTA */}
      <div className={styles["tabs-bar"]}>
        <div className={styles.tabs}>
          {["Product", "Profile", "Income"].map((t) => {
            const key = t.toLowerCase();
            return (
              <button
                key={key}
                className={`${styles.tab} ${activeTab === key ? styles["tab--active"] : ""}`}
                onClick={() => setActiveTab(key)}
              >
                {t}
              </button>
            );
          })}
        </div>
        {activeTab === "product" && (
          <button className={styles.btn} onClick={() => setShowWizard(true)}>
            Add product
          </button>
        )}
      </div>

      {/* Content */}
      <section className={styles.section}>
        {activeTab === "product" && (
          <div className={styles.grid}>
            {products.map((p) => (
              <ProductCard key={p.id} p={p} onDelete={() => removeProduct(p.id)} />
            ))}
          </div>
        )}

        {activeTab === "profile" && (
          <div className={styles["profile-card"]}>
            <div className={styles["profile-card-head"]}>
              {!isEditingProfile ? (
                <button
                  className={styles["icon-btn"]}
                  onClick={() => setIsEditingProfile(true)}
                >
                  ✎ Edit
                </button>
              ) : (
                <div className={styles["profile-actions"]}>
                  <button className={`${styles.btn} ${styles.ghost}`} onClick={cancelProfile}>
                    Cancel
                  </button>
                  <button className={styles.btn} onClick={saveProfile}>
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className={styles.profileTable}>
              <div className={styles.row}>
                <div className={styles.label}>Contact Name:</div>
                <div className={styles.subLabel}>First name:</div>
                <div className={styles.value}>
                  {!isEditingProfile ? (
                    profile.firstName
                  ) : (
                    <input
                      name="firstName"
                      value={draft.firstName}
                      onChange={handleDraft}
                      className={styles.input}
                    />
                  )}
                </div>
                <div className={styles.subLabel}>Last name:</div>
                <div className={styles.value}>
                  {!isEditingProfile ? (
                    profile.lastName
                  ) : (
                    <input
                      name="lastName"
                      value={draft.lastName}
                      onChange={handleDraft}
                      className={styles.input}
                    />
                  )}
                </div>
              </div>

              <hr className={styles.hr} />

              <div className={styles.row}>
                <div className={styles.label}>Contact Number:</div>
                <div className={styles.valueFull}>
                  {!isEditingProfile ? (
                    profile.phone
                  ) : (
                    <input
                      name="phone"
                      value={draft.phone}
                      onChange={handleDraft}
                      className={styles.input}
                    />
                  )}
                </div>
              </div>

              <hr className={styles.hr} />

              <div className={styles.row}>
                <div className={styles.label}>Industry:</div>
                <div className={styles.valueFull}>
                  {!isEditingProfile ? (
                    profile.industry
                  ) : (
                    <select
                      name="industry"
                      value={draft.industry}
                      onChange={handleDraft}
                      className={styles.select}
                    >
                      <option value="beauty">beauty</option>
                      <option value="fashion">fashion</option>
                      <option value="electronics">electronics</option>
                    </select>
                  )}
                </div>
              </div>

              <hr className={styles.hr} />

              <div className={styles.row}>
                <div className={styles.label}>Address:</div>
                <div className={styles.valueFull}>
                  <div className={styles.subgrid}>
                    <div>
                      <span className={styles.subLabel}>Country:</span>{" "}
                      {!isEditingProfile ? (
                        profile.country
                      ) : (
                        <input
                          name="country"
                          value={draft.country}
                          onChange={handleDraft}
                          className={styles.input}
                        />
                      )}
                    </div>
                    <div>
                      <span className={styles.subLabel}>City:</span>{" "}
                      {!isEditingProfile ? (
                        profile.city
                      ) : (
                        <input
                          name="city"
                          value={draft.city}
                          onChange={handleDraft}
                          className={styles.input}
                        />
                      )}
                    </div>
                    <div>
                      <span className={styles.subLabel}>District:</span>{" "}
                      {!isEditingProfile ? (
                        profile.district
                      ) : (
                        <input
                          name="district"
                          value={draft.district}
                          onChange={handleDraft}
                          className={styles.input}
                        />
                      )}
                    </div>
                    <div>
                      <span className={styles.subLabel}>Ward:</span>{" "}
                      {!isEditingProfile ? (
                        profile.ward
                      ) : (
                        <input
                          name="ward"
                          value={draft.ward}
                          onChange={handleDraft}
                          className={styles.input}
                        />
                      )}
                    </div>
                    <div>
                      <span className={styles.subLabel}>Address:</span>{" "}
                      {!isEditingProfile ? (
                        profile.street
                      ) : (
                        <input
                          name="street"
                          value={draft.street}
                          onChange={handleDraft}
                          className={styles.input}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <hr className={styles.hr} />

              <div className={styles.row}>
                <div className={styles.label}>Zip/Postal code:</div>
                <div className={styles.valueFull}>
                  {!isEditingProfile ? (
                    profile.zip
                  ) : (
                    <input
                      name="zip"
                      value={draft.zip}
                      onChange={handleDraft}
                      className={styles.input}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "income" && (
          <div className={styles["profile-card"]}>
            <div className={styles["profile-card-head"]}>
              <div className={styles["title-sm"]}>Income</div>
            </div>
            <div className={styles["profile-body"]}>
              <p>Last 30 days: ₫12,345,000</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
