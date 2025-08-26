import React, { useEffect, useRef, useState } from "react";
import styles from "./VendorProfile.module.scss";

/* Seed demo products */
const seedProducts = [
  { title: "Blue", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "Keyboard", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "Women Outfit", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "New Collection", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "Headphone 50 Hrs", desc: "Lorem Ipsum is simply dummy text of the printing" },
  { title: "Voucher Pack", desc: "Lorem Ipsum is simply dummy text of the printing" },
];

/* ============ Avatar ============ */
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
          <svg viewBox="0 0 512 512" width="96" height="96">
            <circle cx="256" cy="171" r="96" stroke="#6d28d9" strokeWidth="28" fill="none" />
            <path d="M96 428c0-72 72-118 160-118s160 46 160 118" stroke="#6d28d9" strokeWidth="28" strokeLinecap="round" fill="none" />
          </svg>
        )}
      </div>

      <button className={`${styles["icon-btn"]} ${styles["avatar-edit"]}`} onClick={pick} title="Edit">
        ✎
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onChange} />

      {preview && (
        <div className={styles["avatar-actions"]}>
          <button className={`${styles.btn} ${styles.ghost}`} onClick={cancel}>
            Cancel
          </button>
          <button className={styles.btn} onClick={save}>
            Save
          </button>
        </div>
      )}
    </div>
  );
}

/* ============ Product Card ============ */
function ProductCard({ p, onDelete }) {
  return (
    <article className={styles.card}>
      <div className={`${styles["card-media"]} ${p.image ? styles["has-img"] : ""}`}>
        {p.image ? (
          <img className={styles["card-img"]} src={p.image} alt={p.title} />
        ) : (
          <span className={styles["media-badge"]}>{p.title}</span>
        )}
        <button className={styles["delete-btn"]} onClick={onDelete} title="Delete">
          ✕
        </button>
      </div>
      <div className={styles["card-body"]}>
        <div className={styles.title}>{p.title}</div>
        <p className={styles.desc}>{p.desc}</p>
        <a className={styles.rating} href="#rating">
          Rating →
        </a>
      </div>
    </article>
  );
}

/* ============ Main ============ */
export default function VendorProfile() {
  // avatar
  const [avatarUrl, setAvatarUrl] = useState("");

  // company name (view → edit)
  const [companyName, setCompanyName] = useState("Your Store");
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [tempCompanyName, setTempCompanyName] = useState(companyName);

  // tabs
  const [activeTab, setActiveTab] = useState("product");

  // product list
  const [products, setProducts] = useState(() =>
    seedProducts.map((p, i) => ({
      id: `p_${i + 1}`,
      title: p.title,
      desc: p.desc,
      image: null,
    }))
  );

  const removeProduct = (id) => setProducts((list) => list.filter((x) => x.id !== id));

  return (
    <div className={styles.container}>
      {/* Header: avatar + company name */}
      <section className={styles.profileHeader}>
        <Avatar url={avatarUrl} onSaveImage={setAvatarUrl} />

        <div className={styles.companyBlock}>
          <label className={styles["company-label"]}>Company Name</label>

          {!isEditingCompany ? (
            <div className={styles.companyRow}>
              <h2 className={styles["company-name"]}>{companyName}</h2>
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
            </div>
          ) : (
            <div className={styles.companyEditBlock}>
              <input
                className={styles["company-input"]}
                value={tempCompanyName}
                onChange={(e) => setTempCompanyName(e.target.value)}
              />
              <div className={styles["company-actions"]}>
                <button className={`${styles.btn} ${styles.ghost}`} onClick={() => setIsEditingCompany(false)}>
                  Cancel
                </button>
                <button
                  className={styles.btn}
                  onClick={() => {
                    setCompanyName(tempCompanyName.trim() || "Your Store");
                    setIsEditingCompany(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tabs */}
      <div className={styles["tabs-bar"]}>
        <div className={styles.tabs}>
          {["product", "profile", "income"].map((k) => (
            <button
              key={k}
              className={`${styles.tab} ${activeTab === k ? styles["tab--active"] : ""}`}
              onClick={() => setActiveTab(k)}
            >
              {k[0].toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
        <button className={styles.btn}>＋ Add product</button>
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
              <div className={styles["title-sm"]}>Profile</div>
            </div>
            <div className={styles["profile-body"]}>
              <p>Owner: Jane Doe</p>
              <p>Email: vendor@example.com</p>
              <p>Phone: 0900 000 000</p>
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
