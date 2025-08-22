import React, { useMemo, useRef, useState, useEffect } from "react";
import "./VendorProfile.css";

const seedProducts = [
  { title: "Blue", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "Keyboard", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "Women Outfit", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "New Collection", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "Headphone 50 Hrs", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "Voucher Pack", desc: "Lorem Ipsum is simply dummy text of the printing" },
];

/* ================= Avatar ================= */
function Avatar({ url, onSaveImage }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [imgSrc, setImgSrc] = useState(url || "");

  useEffect(() => setImgSrc(url || ""), [url]);

  // cleanup preview objectURL khi unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const openPicker = () => fileRef.current?.click();

  const onChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const blob = URL.createObjectURL(f);
    setPreview(blob);
    e.target.value = "";
  };

  const save = () => {
    if (preview) {
      setImgSrc(preview);
      onSaveImage?.(preview);
      setPreview(null);
    }
  };

  const cancel = () => setPreview(null);

  const showUrl = preview ?? imgSrc;

  return (
    <div className="avatar-wrap">
      <div className="avatar">
        {showUrl ? (
          <img
            src={showUrl}
            alt="Vendor avatar"
            className="avatar-img"
            style={{
              objectFit: "cover", // chỉ giữ fit cover, bỏ posX/posY/zoom
            }}
          />
        ) : (
          <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="256" cy="171" r="96" stroke="#6d28d9" strokeWidth="28" />
            <path d="M96 428c0-72 72-118 160-118s160 46 160 118" stroke="#6d28d9" strokeWidth="28" strokeLinecap="round" />
          </svg>
        )}
      </div>

      <button className="icon-btn avatar-edit" onClick={openPicker} aria-label="Edit avatar">✎</button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onChange} />

      {preview && (
        <div className="avatar-actions" role="group" aria-label="Avatar actions">
          <button className="btn ghost" onClick={cancel}>Cancel</button>
          <button className="btn" onClick={save}>Save</button>
        </div>
      )}
    </div>
  );
}

/* ================= Product Card ================= */
function ProductCard({ p, onDelete }) {
  return (
    <article className="card">
      <div className={`card-media ${p.image ? "has-img" : ""}`} role="img" aria-label={p.title}>
        {p.image ? (
          <img className="card-img" src={p.image} alt={p.title} />
        ) : (
          <span className="media-badge">{p.title}</span>
        )}

        {/* delete */}
        <button
          className="delete-btn"
          onClick={onDelete}
          aria-label={`Delete ${p.title}`}
          title="Delete"
          type="button"
        >
          ✕
        </button>

        <span className="sr-only">{p.title}</span>
      </div>
      <div className="card-body">
        <div className="title">{p.title}</div>
        <p className="desc">{p.desc}</p>
        <a className="rating" href="#rating">Rating →</a>
      </div>
    </article>
  );
}


/* ================= Wizard ================= */
function Wizard({ onCancel, onDone }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "",
    description: "",
    type: "",
    unitLabel: "",
    features: [""],
    pricingModel: "Standard pricing",
    price: "",
    currency: "USD",
    taxEnabled: false,
    taxRate: "",
    taxName: "",
    images: [], // blob urls
  });
  const [errors, setErrors] = useState({}); // { name, images, description, price }

  // ---- IMAGES ----
  const imgInput = useRef(null);
  const openImagePicker = () => imgInput.current?.click();

  const onPickImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const urls = files.map(f => URL.createObjectURL(f));
    setData(s => {
      const merged = [...s.images, ...urls].slice(0, 20);
      return { ...s, images: merged };
    });

    setErrors(prev => (prev.images ? { ...prev, images: undefined } : prev));
    e.target.value = "";
  };

  // ---- Features helpers ----
  const addFeature = () => setData(s => ({ ...s, features: [...s.features, ""] }));
  const updateFeature = (i, v) =>
    setData(s => ({ ...s, features: s.features.map((x, idx) => (idx === i ? v : x)) }));
  const removeFeature = (i) =>
    setData(s => ({ ...s, features: s.features.filter((_, idx) => idx !== i) }));

  // ---- Validation ----
  const validateStep0 = () => {
    const errs = {};
    if (!data.name.trim()) errs.name = "Product name is required";
    if (!data.description.trim()) errs.description = "Description is required";
    if (data.images.length === 0) errs.images = "At least 1 image is required";
    setErrors(prev => ({ ...prev, ...errs }));
    return Object.keys(errs).length === 0;
  };

  const validateStep1 = () => {
    const errs = {};
    const priceNum = Number(data.price);
    if (data.price === "" || Number.isNaN(priceNum) || priceNum <= 0) {
      errs.price = "Price must be greater than 0";
    }
    setErrors(prev => ({ ...prev, ...errs }));
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep(s => Math.min(2, s + 1));
  };
  const back = () => setStep(s => Math.max(0, s - 1));

  const sidebarItem = (label, idx) => (
    <li key={label} className={["wiz-step", step === idx ? "active" : "", step > idx ? "done" : ""].join(" ")}>
      <span className="check">{step > idx ? "✓" : ""}</span>{label}
    </li>
  );

  const addProductAndExit = () => {
    if (!validateStep0()) { setStep(0); return; }
    if (!validateStep1()) { setStep(1); return; }

    const firstImage = data.images[0];
    onDone({
      title: data.name.trim(),
      desc: data.description.trim(),
      image: firstImage || undefined,
    });
  };

  return (
    <div className="wizard">
      <h2 className="wizard-title">NEW PRODUCT</h2>

      <div className="wizard-shell">
        <aside className="wizard-sidebar" aria-label="Steps">
          <ul>
            {sidebarItem("Product Information", 0)}
            {sidebarItem("Pricing Information", 1)}
            {sidebarItem("Review", 2)}
          </ul>
        </aside>

        <section className="wizard-panel">
          {/* STEP 1: PRODUCT INFORMATION */}
          {step === 0 && (
            <>
              <h3 className="panel-title">PRODUCT INFORMATION</h3>

              <label className="f-label">Product Name</label>
              <input
                className="f-input"
                value={data.name}
                onChange={e => {
                  setData(s => ({ ...s, name: e.target.value }));
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                placeholder="Label"
              />
              {errors.name && <div className="error">{errors.name}</div>}

              <label className="f-label">Images</label>
              <div className="image-grid">
                {data.images.map((src, i) => (
                  <div key={i} className="image-cell">
                    <img src={src} alt={`img-${i}`} />
                  </div>
                ))}
                {data.images.length < 20 && (
                  <>
                    <button
                      type="button"
                      className="icon-tile"
                      onClick={openImagePicker}
                      aria-label="Add image"
                      title="Add image"
                    >
                      ＋
                    </button>
                    <input
                      ref={imgInput}
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={onPickImages}
                    />
                  </>
                )}
              </div>
              <div className="help">{data.images.length}/20 images</div>
              {errors.images && <div className="error">{errors.images}</div>}

              <label className="f-label">Description</label>
              <textarea
                className="f-textarea"
                value={data.description}
                onChange={e => {
                  setData(s => ({ ...s, description: e.target.value }));
                  if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                }}
                placeholder="Label"
              />
              {errors.description && <div className="error">{errors.description}</div>}

              <label className="f-label">Product Type</label>
              <input
                className="f-input"
                value={data.type}
                onChange={e => setData(s => ({ ...s, type: e.target.value }))}
                placeholder="Label"
              />

              <details className="details">
                <summary>Additional Info</summary>

                <label className="f-label">Unit Label</label>
                <input
                  className="f-input"
                  value={data.unitLabel}
                  onChange={e => setData(s => ({ ...s, unitLabel: e.target.value }))}
                  placeholder="Label"
                />

                <label className="f-label">Feature List</label>
                {data.features.map((f, i) => (
                  <div className="feature-row" key={i}>
                    <input
                      className="f-input"
                      value={f}
                      onChange={e => updateFeature(i, e.target.value)}
                      placeholder="Label"
                    />
                    {data.features.length > 1 && (
                      <button
                        className="icon-btn danger"
                        onClick={() => removeFeature(i)}
                        aria-label="Remove feature"
                        type="button"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                ))}
                <button className="link-btn" type="button" onClick={addFeature}>
                  ＋ Add Another Feature
                </button>
              </details>

              <div className="wizard-actions">
                <button className="btn ghost" onClick={onCancel}>Cancel</button>
                <button className="btn" onClick={next}>Continue →</button>
              </div>
            </>
          )}

          {/* STEP 2: PRICING INFORMATION */}
          {step === 1 && (
            <>
              <h3 className="panel-title">PRICING INFORMATION</h3>

              <label className="f-label">Pricing Model</label>
              <select
                className="f-input"
                value={data.pricingModel}
                onChange={e => setData(s => ({ ...s, pricingModel: e.target.value }))}
              >
                <option>Standard pricing</option>
                <option>Tiered pricing</option>
                <option>Subscription</option>
              </select>

              <label className="f-label">Price</label>
              <div className="row">
                <input
                  type="number"
                  className="f-input"
                  min="0"
                  step="0.01"
                  value={data.price}
                  onChange={e => {
                    setData(s => ({ ...s, price: e.target.value }));
                    if (errors.price) setErrors(prev => ({ ...prev, price: undefined }));
                  }}
                  placeholder="Add Price"
                />
                <select
                  className="f-input"
                  style={{ maxWidth: 110 }}
                  value={data.currency}
                  onChange={e => setData(s => ({ ...s, currency: e.target.value }))}
                >
                  <option>USD</option><option>VND</option><option>EUR</option>
                </select>
              </div>
              {errors.price && <div className="error">{errors.price}</div>}

              <label className="f-label">Description (optional)</label>
              <textarea
                className="f-textarea"
                value={data.pricingDesc || ""}
                onChange={e => setData(s => ({ ...s, pricingDesc: e.target.value }))}
                placeholder="Label"
              />

              <details className="details">
                <summary>Additional Info</summary>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={data.taxEnabled}
                    onChange={e => setData(s => ({ ...s, taxEnabled: e.target.checked }))}
                  />
                  <span>Add tax</span>
                </label>

                {data.taxEnabled && (
                  <div className="row">
                    <div className="col">
                      <label className="f-label">Rate</label>
                      <div className="row">
                        <input
                          type="number"
                          className="f-input"
                          min="0"
                          step="0.01"
                          value={data.taxRate}
                          onChange={e => setData(s => ({ ...s, taxRate: e.target.value }))}
                          placeholder="Label"
                        />
                        <span className="unit">%</span>
                      </div>
                    </div>
                    <div className="col">
                      <label className="f-label">Tax Name</label>
                      <input
                        className="f-input"
                        value={data.taxName}
                        onChange={e => setData(s => ({ ...s, taxName: e.target.value }))}
                        placeholder="Label"
                      />
                    </div>
                  </div>
                )}
              </details>

              <div className="wizard-actions">
                <button className="btn ghost" onClick={onCancel}>Cancel</button>
                <button className="btn ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next}>Continue →</button>
              </div>
            </>
          )}

          {/* STEP 3: REVIEW */}
          {step === 2 && (
            <>
              <h3 className="panel-title">PREVIEW</h3>

              <div className="review">
                <div className="review-media">
                  {data.images[0] ? <img src={data.images[0]} alt="preview" /> : <div className="image-placeholder lg" />}
                  <div className="caption">{data.name || "—"}</div>
                </div>

                <div className="review-table">
                  <div className="review-row head">Product Details</div>
                  <div className="review-row"><div>Product Name</div><div>{data.name || "—"}</div></div>
                  <div className="review-row"><div>Product Description</div><div>{data.description || "—"}</div></div>
                  <div className="review-row"><div>Product Type</div><div>{data.type || "—"}</div></div>

                  <div className="review-row head">Pricing Details</div>
                  <div className="review-row"><div>Model</div><div>{data.pricingModel}</div></div>
                  <div className="review-row"><div>Price</div><div>{data.price ? `${data.price} ${data.currency}` : "—"}</div></div>
                  {data.taxEnabled && (
                    <div className="review-row"><div>Tax</div><div>{data.taxRate || 0}% — {data.taxName || "Tax"}</div></div>
                  )}
                </div>
              </div>

              <div className="wizard-actions">
                <button className="btn ghost" onClick={onCancel}>Cancel</button>
                <button className="btn ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={addProductAndExit}>Add Product →</button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function ProfilePanel() {
  const [form, setForm] = React.useState({
    firstName: "ABC",
    lastName: "DEF",
    contactNumber: "+84 123456789",
    industry: "beauty",
    country: "ABC",
    city: "DEF",
    district: "GHI",
    ward: "KLM",
    addressLine: "123 NOQ street, KLM ward, GHI district, DEF city, ABC country",
    zipCode: "12345",
  });
  const [editing, setEditing] = React.useState(false);

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const toggleEdit = () => setEditing((s) => !s);
  const save = () => setEditing(false);

  return (
    <div className="profile-card">
      <div className="profile-card-head">
        <div className="title-sm">Profile</div>
        <div className="spacer" />
        <div className="actions">
          <button className="btn ghost" onClick={toggleEdit}>
            {editing ? "Cancel" : "Edit"}
          </button>
          {editing && <button className="btn" onClick={save}>Save</button>}
        </div>
      </div>

      {/* Contact Name */}
      <div className="profile-row">
        <div className="label">Contact Name:</div>
        <div className="kv-grid">
          <div className="kv">
            <div className="k">First name:</div>
            <div className="v">
              {editing ? (
                <input className="f-input" value={form.firstName} onChange={onChange("firstName")} />
              ) : (<span>{form.firstName}</span>)}
            </div>
          </div>
          <div className="kv">
            <div className="k">Last name:</div>
            <div className="v">
              {editing ? (
                <input className="f-input" value={form.lastName} onChange={onChange("lastName")} />
              ) : (<span>{form.lastName}</span>)}
            </div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* Contact Number */}
      <div className="profile-row">
        <div className="label">Contact Number:</div>
        <div className="value">
          {editing ? (
            <input className="f-input" value={form.contactNumber} onChange={onChange("contactNumber")} />
          ) : (<span>{form.contactNumber}</span>)}
        </div>
      </div>

      <hr className="divider" />

      {/* Industry */}
      <div className="profile-row">
        <div className="label">Industry:</div>
        <div className="value">
          {editing ? (
            <select className="f-input" value={form.industry} onChange={onChange("industry")}>
              <option value="beauty">beauty</option>
              <option value="fashion">fashion</option>
              <option value="electronics">electronics</option>
              <option value="grocery">grocery</option>
            </select>
          ) : (<span className="pill">{form.industry}</span>)}
        </div>
      </div>

      <hr className="divider" />

      {/* Address block */}
      <div className="profile-row">
        <div className="label">Address:</div>
        <div className="kv-grid">
          <div className="kv">
            <div className="k">Country:</div>
            <div className="v">
              {editing ? (
                <input className="f-input" value={form.country} onChange={onChange("country")} />
              ) : (<span>{form.country}</span>)}
            </div>
          </div>
          <div className="kv">
            <div className="k">City:</div>
            <div className="v">
              {editing ? (
                <input className="f-input" value={form.city} onChange={onChange("city")} />
              ) : (<span>{form.city}</span>)}
            </div>
          </div>
          <div className="kv">
            <div className="k">District:</div>
            <div className="v">
              {editing ? (
                <input className="f-input" value={form.district} onChange={onChange("district")} />
              ) : (<span>{form.district}</span>)}
            </div>
          </div>
          <div className="kv">
            <div className="k">Ward:</div>
            <div className="v">
              {editing ? (
                <input className="f-input" value={form.ward} onChange={onChange("ward")} />
              ) : (<span>{form.ward}</span>)}
            </div>
          </div>

          <div className="kv full">
            <div className="k">Address:</div>
            <div className="v">
              {editing ? (
                <input className="f-input" value={form.addressLine} onChange={onChange("addressLine")} />
              ) : (<span>{form.addressLine}</span>)}
            </div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* Zip/Postal code */}
      <div className="profile-row">
        <div className="label">Zip/Postal code:</div>
        <div className="value">
          {editing ? (
            <input className="f-input" value={form.zipCode} onChange={onChange("zipCode")} />
          ) : (<span>{form.zipCode}</span>)}
        </div>
      </div>
    </div>
  );
}


/* ================= VF ================= */
export default function VendorProfile() {
  const [companyName, setCompanyName] = useState("Company Name");
  const [companyDraft, setCompanyDraft] = useState("Company Name");
  const [editingCompany, setEditingCompany] = useState(false);

  const [activeTab, setActiveTab] = useState("products"); // products | profile | income
  const [mode, setMode] = useState("list");               // list | add

  const [avatarUrl, setAvatarUrl] = useState("");

  const uid = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;

  const [products, setProducts] = useState(() =>
    seedProducts.map(p => ({ ...p, id: p.id ?? uid() }))
  );

  const startAdd  = () => { setMode("add"); setActiveTab("products"); };
  const cancelAdd = () => setMode("list");

  const finishAdd = (newP) => {
    const withId = { id: uid(), ...newP };
    setProducts(prev => [withId, ...prev]);
    setMode("list");
    setActiveTab("products");
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const saveCompany = () => {
    setCompanyName(companyDraft.trim() || "Company Name");
    setEditingCompany(false);
  };

  return (
    <div className="container">
      {/* Header */}
      <section className="profile" aria-labelledby="profile-heading">
        <Avatar url={avatarUrl} onSaveImage={setAvatarUrl} />
        <div className="company">
          <div className="company-row">
            {!editingCompany ? (
              <>
                <div className="company-name" aria-live="polite">{companyName}</div>
                <button
                  className="icon-btn"
                  onClick={() => { setCompanyDraft(companyName); setEditingCompany(true); }}
                  aria-label="Edit company name"
                >
                  ✎
                </button>
              </>
            ) : (
              <>
                <input
                  className="f-input company-input"
                  value={companyDraft}
                  onChange={(e) => setCompanyDraft(e.target.value)}
                  placeholder="Enter company name…"
                />
                <div className="company-actions">
                  <button className="btn ghost" onClick={() => setEditingCompany(false)}>Cancel</button>
                  <button className="btn" onClick={saveCompany}>Save</button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Tabs + CTA */}
      <div className="tabs-bar" role="tablist" aria-label="Company sections">
        <div className="tabs">
          <button id="tab-products" className="tab" role="tab" aria-selected={activeTab === "products"} aria-controls="panel-products" onClick={() => setActiveTab("products")}>Product</button>
          <button id="tab-profile"  className="tab" role="tab" aria-selected={activeTab === "profile"}  aria-controls="panel-profile"  onClick={() => setActiveTab("profile")}>Profile</button>
          <button id="tab-income"   className="tab" role="tab" aria-selected={activeTab === "income"}   aria-controls="panel-income"   onClick={() => setActiveTab("income")}>Income</button>
        </div>
        {activeTab === "products" && mode === "list" && (
          <button className="btn" onClick={startAdd}>
            <span aria-hidden="true">＋</span> Add product
          </button>
        )}
      </div>

      {/* Panels */}
      {activeTab === "products" && (
        <section id="panel-products" className="section" role="tabpanel" aria-labelledby="tab-products">
          {mode === "list" ? (
            <div className="grid">
              {products.map((p) => (
                <ProductCard
                  key={p.id}           // dùng key ổn định theo id
                  p={p}
                  onDelete={() => {    // truyền handler xoá xuống card
                    if (window.confirm(`Delete "${p.title}"?`)) deleteProduct(p.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <Wizard onCancel={cancelAdd} onDone={finishAdd} />
          )}
        </section>
      )}

      {activeTab === "profile" && (
        <section id="panel-profile" className="section" role="tabpanel" aria-labelledby="tab-profile">
          <ProfilePanel />
        </section>
      )}


      {activeTab === "income" && (
        <section id="panel-income" className="section" role="tabpanel" aria-labelledby="tab-income">
          <p className="desc">Income / revenue table will go here.</p>
        </section>
      )}
    </div>
  );
}
