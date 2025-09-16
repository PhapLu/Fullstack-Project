import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./VendorProfile.module.scss";
import Avatar from "../../../components/profile/avatar/Avatar";
import ProductCard from "../../../components/product/productCard/ProductCard";
import CreateProduct from "../../../components/product/createProduct/CreateProduct";
import { apiUtils } from "../../../utils/newRequest";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe, selectUser } from "../../../store/slices/authSlices";
import { getImageUrl } from "../../../utils/imageUrl";
import { isFilled, isValidPhone, minLength } from "../../../utils/validator";
import ConfirmDeleteModal from "../../../components/deleteProduct/ConfirmDeleteModal";

export default function VendorProfile() {
    const { profileId } = useParams();
    const user = useSelector(selectUser);
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();
    const backupRef = useRef(null);

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
                const response = await apiUtils.get(
                    `/product/readProfileProducts/${profileId}`
                );
                setProducts(response.data?.metadata?.products ?? []);
            } catch (err) {
                console.error("Failed to fetch products", err);
            }
        };
        if (profileId) fetchProducts();
    }, [profileId]);

    // Delete modal state
    const [openDelete, setOpenDelete] = useState(false);
    const [target, setTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteErr, setDeleteErr] = useState("");

    const askDelete = (p) => {
        setTarget(p);
        setDeleteErr("");
        setOpenDelete(true);
    };

    const removeProductConfirmed = async (typed) => {
        if (typed !== "DELETE" || !target?._id) return;
        setDeleting(true);
        setDeleteErr("");
        backupRef.current = products;

        // Optimistic
        setProducts((list) => list.filter((x) => x._id !== target._id));

        try {
            await apiUtils.delete(`/product/deleteProduct/${target._id}`);
            setOpenDelete(false);
            setTarget(null);
        } catch (err) {
            console.error("Failed to delete product:", err);
            setProducts(backupRef.current || []);
            setDeleteErr("Delete failed. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    const [fetchedUser, setFetchedUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [draft, setDraft] = useState(null);
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
                    const { data } = await apiUtils.get(
                        `/user/readUserProfile/${profileId}`
                    );
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

    const validateVendorProfile = (f) => {
        const e = {};

        if (isFilled(f.phone) && !isValidPhone(f.phone)) {
            e.phone =
                "Invalid phone. Use VN format (0/ +84 + carrier + 8 digits).";
        }

        if (!isFilled(f.country)) {
            e.country = "Country is required.";
        }

        if (!minLength(f.vendorProfile?.businessName, 5)) {
            e.businessName = "Business name is required (min 5 characters).";
        }

        if (!minLength(f.vendorProfile?.businessAddress, 5)) {
            e.businessAddress =
                "Business address is required (min 5 characters).";
        }

        return e;
    };

    const saveProfile = async () => {
        if (!isOwner || !draft) return;
        const nextErrors = validateVendorProfile(draft);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        try {
            const payload = {
                phone: draft.phone ?? "",
                country: draft.country ?? "Vietnam",
                vendorProfile: {
                    businessName: draft?.vendorProfile?.businessName ?? "",
                    businessAddress:
                        draft?.vendorProfile?.businessAddress ?? "",
                },
            };

            const { data } = await apiUtils.patch(
                "/user/updateUserProfile",
                payload
            );
            const updated = data?.metadata?.user;

            setProfile(updated);
            setDraft(updated);
            setIsEditingProfile(false);
            setErrors({});

            if (isOwner) dispatch(fetchMe());
        } catch (e) {
            console.error("Failed to save vendor profile", e);
        }
    };

    const cancelProfile = () => {
        setDraft(profile);
        setIsEditingProfile(false);
    };

    // Tabs & create product wizard
    const [activeTab, setActiveTab] = useState("products");
    const [showWizard, setShowWizard] = useState(false);
    const tabs = ["Products", "Profile"];

    // Early guard used later in JSX
    const isLoading = !profile || !draft;

    const onAddProductDone = (created) => {
        if (created?._id || created?.id) {
            setProducts((arr) => [created, ...arr]);
        } else if (created?.title) {
            setProducts((arr) => [
                {
                    _id: `tmp_${Date.now()}`,
                    title: created.title,
                    description: created.description || "—",
                    images: created.images || [],
                    status: created.status || "active",
                },
                ...arr,
            ]);
        }
        setShowWizard(false);
    };

    return (
        <>
            {showWizard ? (
                <CreateProduct
                    onCancel={() => setShowWizard(false)}
                    onDone={onAddProductDone}
                />
            ) : isLoading ? (
                <div className="container-xl py-4">Loading…</div>
            ) : (
                <div className={styles.container}>
                    {/* Header */}
                    <section className={styles.profileHeader}>
                        <Avatar
                            isOwner={isOwner}
                            url={getImageUrl(profile?.avatar)}
                            onSaveImage={
                                isOwner
                                    ? (url) => {
                                          setProfile((p) => ({
                                              ...p,
                                              avatar: url,
                                          }));
                                          setDraft((p) => ({
                                              ...p,
                                              avatar: url,
                                          }));
                                      }
                                    : undefined
                            }
                        />
                        <div className={styles.companyBlock}>
                            <div className={styles["company-row"]}>
                                <span className={styles["company-label"]}>
                                    Company Name:
                                </span>
                                <span className={styles["company-name"]}>
                                    {profile?.vendorProfile?.businessName || (
                                        <span className={styles.muted}>—</span>
                                    )}
                                </span>
                            </div>

                            {!isOwner && (
                                // VendorProfile.jsx
                                <button
                                    type="button"
                                    className={styles.chatBtn}
                                    onClick={() => {
                                        window.dispatchEvent(
                                            new CustomEvent("openChatWith", {
                                                detail: {
                                                    otherUser: {
                                                        _id: profile?._id,
                                                        name:
                                                            profile
                                                                ?.vendorProfile
                                                                ?.businessName ||
                                                            profile?.username,
                                                        avatar: profile?.avatar,
                                                    },
                                                },
                                            })
                                        );
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="20px"
                                        viewBox="0 -960 960 960"
                                        width="20px"
                                        fill="#000"
                                    >
                                        <path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
                                    </svg>{" "}
                                    Contact
                                </button>
                            )}
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
                        {activeTab === "products" && isOwner && (
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
                        {activeTab === "products" && (
                            <div className={styles.grid}>
                                {products?.map((p) => (
                                    <ProductCard
                                        key={p._id}
                                        product={p}
                                        onDelete={
                                            isOwner
                                                ? () => askDelete(p)
                                                : undefined
                                        }
                                    />
                                ))}
                            </div>
                        )}

                        {activeTab === "profile" && (
                            <div className={styles["profile-card"]}>
                                <div className={styles["profile-card-head"]}>
                                    {!isEditingProfile && isOwner && (
                                        <div className={styles.actions}>
                                            <button
                                                type="button"
                                                className={
                                                    styles["icon-btn-profile"]
                                                }
                                                onClick={() =>
                                                    isOwner &&
                                                    setIsEditingProfile(true)
                                                }
                                                disabled={!isOwner}
                                            >
                                                Edit information
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.profileTable}>
                                    {/* Business Name */}
                                    <div className={styles.row}>
                                        <div className={styles.label}>
                                            Company Name:
                                        </div>
                                        <div className={styles.value}>
                                            {!isEditingProfile ? (
                                                profile?.vendorProfile
                                                    ?.businessName || (
                                                    <span
                                                        className={styles.muted}
                                                    >
                                                        —
                                                    </span>
                                                )
                                            ) : (
                                                <>
                                                    <input
                                                        value={
                                                            draft?.vendorProfile
                                                                ?.businessName ??
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setDraft(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    vendorProfile:
                                                                        {
                                                                            ...(prev.vendorProfile ||
                                                                                {}),
                                                                            businessName:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                })
                                                            )
                                                        }
                                                        className={styles.input}
                                                        placeholder="Business name"
                                                        disabled={!isOwner}
                                                    />
                                                    {errors.businessName && (
                                                        <div className="invalid-feedback d-block">
                                                            {
                                                                errors.businessName
                                                            }
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <hr className={styles.hr} />

                                    {/* Phone */}
                                    <div className={styles.row}>
                                        <div className={styles.label}>
                                            Contact Number:
                                        </div>
                                        <div className={styles.valueFull}>
                                            {!isEditingProfile ? (
                                                profile?.phone || (
                                                    <span
                                                        className={styles.muted}
                                                    >
                                                        —
                                                    </span>
                                                )
                                            ) : (
                                                <>
                                                    <input
                                                        name="phone"
                                                        value={
                                                            draft?.phone ?? ""
                                                        }
                                                        onChange={handleDraft}
                                                        className={styles.input}
                                                        placeholder="+84 ..."
                                                        disabled={!isOwner}
                                                    />
                                                    {errors.phone && (
                                                        <div className="invalid-feedback d-block">
                                                            {errors.phone}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <hr className={styles.hr} />

                                    {/* Business Address */}
                                    <div className={styles.row}>
                                        <div className={styles.label}>
                                            Business Address:
                                        </div>
                                        <div className={styles.valueFull}>
                                            {!isEditingProfile ? (
                                                profile?.vendorProfile
                                                    ?.businessAddress || (
                                                    <span
                                                        className={styles.muted}
                                                    >
                                                        —
                                                    </span>
                                                )
                                            ) : (
                                                <>
                                                    <input
                                                        value={
                                                            draft?.vendorProfile
                                                                ?.businessAddress ??
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setDraft(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    vendorProfile:
                                                                        {
                                                                            ...(prev.vendorProfile ||
                                                                                {}),
                                                                            businessAddress:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                })
                                                            )
                                                        }
                                                        className={styles.input}
                                                        placeholder="Registered business address"
                                                        disabled={!isOwner}
                                                    />
                                                    {errors.businessAddress && (
                                                        <div className="invalid-feedback d-block">
                                                            {
                                                                errors.businessAddress
                                                            }
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <hr className={styles.hr} />

                                    {isEditingProfile && isOwner && (
                                        <div
                                            className={
                                                styles["profile-actions"]
                                            }
                                        >
                                            <button
                                                className={styles.btn}
                                                onClick={saveProfile}
                                            >
                                                Save
                                            </button>
                                            <button
                                                className={`${styles.btn} ${styles.ghost}`}
                                                onClick={cancelProfile}
                                            >
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

            {/* Delete modal */}
            <ConfirmDeleteModal
                open={openDelete}
                product={target}
                loading={deleting}
                error={deleteErr}
                onCancel={() => {
                    if (deleting) return;
                    setOpenDelete(false);
                    setTarget(null);
                    setDeleteErr("");
                }}
                onConfirm={removeProductConfirmed}
                setProducts={setProducts}
            />
        </>
    );
}
