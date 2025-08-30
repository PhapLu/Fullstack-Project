import React, { useEffect, useState } from "react";
import styles from "./VendorProfile.module.scss";
import Avatar from "../../../components/profile/avatar/Avatar";
import ProductCard from "../../../components/product/productCard/ProductCard";
import CreateProduct from "../../../components/product/createProduct/CreateProduct";
import { apiUtils } from "../../../utils/newRequest";
import { useParams } from "react-router-dom";

/* ================== Seed demo products ================== */
export default function VendorProfile() {
    const { profileId } = useParams();

    const [avatarUrl, setAvatarUrl] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [isEditingCompany, setIsEditingCompany] = useState(false);
    const [tempCompanyName, setTempCompanyName] = useState(companyName);
    const [activeTab, setActiveTab] = useState("product");
    const [showWizard, setShowWizard] = useState(false);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const reponse = await apiUtils.get(`/product/readProfileProducts/${profileId}`);
                setProducts(reponse.data.metadata.products);
            } catch (err) {
                console.error("Failed to fetch products", err);
            }
        };
      
        if (profileId) fetchProducts();
    }, [profileId]);

    console.log(products);

    const removeProduct = (id) =>
        setProducts((list) => list.filter((x) => x.id !== id));

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profile, setProfile] = useState({});
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
            <CreateProduct
                onCancel={() => setShowWizard(false)}
                onDone={(data) => {
                    if (data?.name) {
                        setProducts((arr) => [
                            {
                                id: `p_${Date.now()}`,
                                title: data.name,
                                desc: data.description || "—",
                                image: data.images?.[0]?.url ?? null,
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
                        <span className={styles["company-label"]}>
                            Company Name:
                        </span>
                        {!isEditingCompany ? (
                            <>
                                <span className={styles["company-name"]}>
                                    {companyName || (
                                        <span className={styles.muted}> </span>
                                    )}
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
                                    onChange={(e) =>
                                        setTempCompanyName(e.target.value)
                                    }
                                    placeholder="Company Name"
                                />
                                <div className={styles["company-actions"]}>
                                    <button
                                        className={`${styles.btn} ${styles.ghost}`}
                                        onClick={() =>
                                            setIsEditingCompany(false)
                                        }
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={styles.btn}
                                        onClick={() => {
                                            setCompanyName(
                                                (tempCompanyName || "").trim()
                                            );
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
                    {["Product", "Profile", "Income"]?.map((t) => {
                        const key = t.toLowerCase();
                        return (
                            <button
                                key={key}
                                className={`${styles.tab} ${
                                    activeTab === key
                                        ? styles["tab--active"]
                                        : ""
                                }`}
                                onClick={() => setActiveTab(key)}
                            >
                                {t}
                            </button>
                        );
                    })}
                </div>
                {activeTab === "product" && (
                    <button
                        className={styles.btn}
                        onClick={() => setShowWizard(true)}
                    >
                        Add product
                    </button>
                )}
            </div>

            {/* Content */}
            <section className={styles.section}>
                {activeTab === "product" && (
                    <div className={styles.grid}>
                        {products?.map((p) => (
                            <ProductCard
                                key={p.id}
                                p={p}
                                onDelete={() => removeProduct(p.id)}
                            />
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
                                    <button
                                        className={`${styles.btn} ${styles.ghost}`}
                                        onClick={cancelProfile}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={styles.btn}
                                        onClick={saveProfile}
                                    >
                                        Save
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={styles.profileTable}>
                            <div className={styles.row}>
                                <div className={styles.label}>
                                    Contact Name:
                                </div>
                                <div className={styles.subLabel}>
                                    First name:
                                </div>
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
                                <div className={styles.subLabel}>
                                    Last name:
                                </div>
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
                                <div className={styles.label}>
                                    Contact Number:
                                </div>
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
                                            <option value="beauty">
                                                beauty
                                            </option>
                                            <option value="fashion">
                                                fashion
                                            </option>
                                            <option value="electronics">
                                                electronics
                                            </option>
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
                                            <span className={styles.subLabel}>
                                                Country:
                                            </span>{" "}
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
                                            <span className={styles.subLabel}>
                                                City:
                                            </span>{" "}
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
                                            <span className={styles.subLabel}>
                                                District:
                                            </span>{" "}
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
                                            <span className={styles.subLabel}>
                                                Ward:
                                            </span>{" "}
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
                                            <span className={styles.subLabel}>
                                                Address:
                                            </span>{" "}
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
                                <div className={styles.label}>
                                    Zip/Postal code:
                                </div>
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
