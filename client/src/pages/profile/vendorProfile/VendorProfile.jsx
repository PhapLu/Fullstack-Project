import React, { useEffect, useMemo, useState } from "react";
import styles from "./VendorProfile.module.scss";
import Avatar from "../../../components/profile/avatar/Avatar";
import ProductCard from "../../../components/product/productCard/ProductCard";
import CreateProduct from "../../../components/product/createProduct/CreateProduct";
import { apiUtils } from "../../../utils/newRequest";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe, selectUser } from "../../../store/slices/authSlices";
import { getAvatarUrl } from "../../../utils/imageUrl";

export default function VendorProfile() {
    const { profileId } = useParams();
    const user = useSelector(selectUser);
    const dispatch = useDispatch()

    // Identify if the current viewer owns this profile
    const isOwner = useMemo(() => {
        if (!user || !profileId) return false;
        return user._id === profileId || user.username === profileId;
    }, [user, profileId]);

    // Products
    const [products, setProducts] = useState([]);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await apiUtils.get(`/product/readProfileProducts/${profileId}`);
                setProducts(response.data?.metadata?.products ?? []);
            } catch (err) {
                console.error("Failed to fetch products", err);
            }
        };
        if (profileId) fetchProducts();
    }, [profileId]);

    const removeProduct = (id) => {
        setProducts((list) => list.filter((x) => (x._id || x.id) !== id));
    };

    // User data (owner: from Redux, visitor: fetch from DB)
    const [fetchedUser, setFetchedUser] = useState(null);
    const [profile, setProfile] = useState(null); // view model for rendering
    const [draft, setDraft] = useState(null);     // local editable copy
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                if (isOwner && user) {
                    const clone = JSON.parse(JSON.stringify(user));
                    if (!isEditingProfile) {
                        setProfile(clone);
                        setDraft(clone);
                    }
                } else if (profileId) {
                    const { data } = await apiUtils.get(`/user/${profileId}`); // adjust if needed
                    const u = data?.user || data?.metadata?.user || data || {};
                    setFetchedUser(u);
                    const clone = JSON.parse(JSON.stringify(u));
                    if (!isEditingProfile) {
                        setProfile(clone);
                        setDraft(clone);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch vendor", err);
            }
        };
        load();
    }, [isOwner, user, profileId, isEditingProfile]);

    // Handlers for profile edit
    const handleDraft = (e) => {
        const { name, value } = e.target;
        setDraft((p) => ({ ...p, [name]: value }));
    };

    const saveProfile = async () => {
        if (!isOwner || !draft) return;
        try {
            // Build a minimal payload that matches your User model
            const payload = {
                phone: draft.phone ?? "",
                country: draft.country ?? "Vietnam",
                vendorProfile: {
                    businessName: draft?.vendorProfile?.businessName ?? "",
                    businessAddress: draft?.vendorProfile?.businessAddress ?? "",
                },
            };
        
            const { data } = await apiUtils.patch("/user/updateUserProfile", payload);
            const updated = data?.metadata?.user
            console.log("Update response:", updated);
        
            // Update local state
            setProfile(updated);
            setDraft(updated);
            setIsEditingProfile(false);
        
            // If this is the owner, also update Redux so rest of the app sees new data
            if(isOwner) 
                dispatch(fetchMe());
        } catch (e) {
            console.error("Failed to save vendor profile", e);
        }
    };
      

    const cancelProfile = () => {
        setDraft(profile);
        setIsEditingProfile(false);
    };

    // Tabs & create product wizard
    const [activeTab, setActiveTab] = useState("product");
    const [showWizard, setShowWizard] = useState(false);
    const tabs = ["Products", "Profile"]

    // Early guard used later in JSX
    const isLoading = !profile || !draft;

    // Expose helpers you’ll use in the JSX (Avatar, ProductCard, CreateProduct need these)
    const onAddProductDone = (data) => {
        if (data?.name) {
            setProducts((arr) => [
                {
                    _id: `tmp_${Date.now()}`,
                    title: data.name,
                    desc: data.description || "—",
                    image: data.images?.[0]?.url ?? null,
                },
                ...arr,
            ]);
        }
        setShowWizard(false);
    };

    return (
        <>
            {showWizard ? (
                <CreateProduct onCancel={() => setShowWizard(false)} onDone={onAddProductDone} />
            ) : isLoading ? (
                <div className="container-xl py-4">Loading…</div>
            ) : (
                <div className={styles.container}>
                    {/* Header */}
                    <section className={styles.profileHeader}>
                        <Avatar
                            url={getAvatarUrl(profile?.avatar)}
                            onSaveImage={isOwner ? (url) => setDraft((p) => ({ ...p, avatar: url })) : undefined}
                        />
                        <div className={styles.companyBlock}>
                            <div className={styles["company-row"]}>
                                <span className={styles["company-label"]}>Company Name:</span>
                                <span className={styles["company-name"]}>
                                    {profile?.vendorProfile?.businessName || <span className={styles.muted}>—</span>}
                                </span>
                            </div>
                        </div>
                    </section>
            
                    {/* Tabs + CTA */}
                    <div className={styles["tabs-bar"]}>
                        <div className={styles.tabs}>
                            {tabs.map((t) => {
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
                        {activeTab === "product" && isOwner && (
                            <button className={styles.btn} onClick={() => setShowWizard(true)}>
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
                                    key={p._id || p.id}
                                    p={p}
                                    onDelete={isOwner ? () => removeProduct(p._id || p.id) : undefined}
                                />
                                ))}
                            </div>
                        )}
        
                    {activeTab === "profile" && (
                        <div className={styles["profile-card"]}>
                            <div className={styles["profile-card-head"]}>
                                {!isEditingProfile && isOwner && (
                                    <button className={styles["icon-btn-profile"]} onClick={() => setIsEditingProfile(true)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="21px" viewBox="0 -960 960 960" width="21px" fill="#000000"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                                    </button>
                                )}
                            </div>
            
                            <div className={styles.profileTable}>
                                {/* Contact Name (map to fullName) + Business Name side-by-side to keep UI */}
                                <div className={styles.row}>
                                    <div className={styles.label}>Company Name:</div>
                                    <div className={styles.value}>
                                        {!isEditingProfile ? (
                                            profile?.vendorProfile?.businessName || <span className={styles.muted}>—</span>
                                        ) : (
                                            <input
                                            value={draft?.vendorProfile?.businessName ?? ""}
                                            onChange={(e) =>
                                                setDraft((prev) => ({
                                                ...prev,
                                                vendorProfile: {
                                                    ...(prev.vendorProfile || {}),
                                                    businessName: e.target.value,
                                                },
                                                }))
                                            }
                                            className={styles.input}
                                            placeholder="Business name"
                                            disabled={!isOwner}
                                            />
                                        )}
                                    </div>
                                </div>
                
                                <hr className={styles.hr} />
                
                                {/* Contact Number (phone) */}
                                <div className={styles.row}>
                                    <div className={styles.label}>Contact Number:</div>
                                    <div className={styles.valueFull}>
                                        {!isEditingProfile ? (
                                            profile?.phone || <span className={styles.muted}>—</span>
                                        ) : (
                                            <input
                                            name="phone"
                                            value={draft?.phone ?? ""}
                                            onChange={handleDraft}
                                            className={styles.input}
                                            placeholder="+84 ..."
                                            disabled={!isOwner}
                                            />
                                        )}
                                    </div>
                                </div>
                
                                <hr className={styles.hr} />
                
                                {/* Business Address (reuse Industry row shell) */}
                                <div className={styles.row}>
                                    <div className={styles.label}>Business Address:</div>
                                    <div className={styles.valueFull}>
                                        {!isEditingProfile ? (
                                            profile?.vendorProfile?.businessAddress || <span className={styles.muted}>—</span>
                                        ) : (
                                            <input
                                            value={draft?.vendorProfile?.businessAddress ?? ""}
                                            onChange={(e) =>
                                                setDraft((prev) => ({
                                                ...prev,
                                                vendorProfile: {
                                                    ...(prev.vendorProfile || {}),
                                                    businessAddress: e.target.value,
                                                },
                                                }))
                                            }
                                            className={styles.input}
                                            placeholder="Registered business address"
                                            disabled={!isOwner}
                                            />
                                        )}
                                    </div>
                                </div>
                
                                <hr className={styles.hr} />
                
                                {isEditingProfile && isOwner && (
                                    <div className={styles["profile-actions"]}>
                                        <button className={styles.btn} onClick={saveProfile}>
                                            Save
                                        </button>
                                        <button className={`${styles.btn} ${styles.ghost}`} onClick={cancelProfile}>
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        )}
                    </section>
                </div>
            )}
        </>
    );
}
