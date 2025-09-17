import { useEffect, useMemo, useState } from "react";
import styles from "./UserProfile.module.scss";
import { useSelector } from "react-redux";
import { selectAuth, selectUser } from "../../../store/slices/authSlices";
import { apiUtils } from "../../../utils/newRequest";
import Avatar from "../../../components/profile/avatar/Avatar";
import { getImageUrl } from "../../../utils/imageUrl";
import { useNavigate, useParams } from "react-router-dom";
import { isFilled, isValidPhone, minLength } from "../../../utils/validator";

export default function UserProfile() {
    const { user, status } = useSelector(selectAuth);
    const { profileId } = useParams();
    const [errors, setErrors] = useState({});
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(getImageUrl(user?.avatar));
    const navigate = useNavigate();

    useEffect(() => {
        if ((status === "succeeded" || status === "failed") && !user) {
            navigate("/signIn", { replace: true });
        }
    }, [user, status, navigate]);

    const isOwner = useMemo(() => {
        if (!user || !profileId) return false;
        return user._id === profileId || user.username === profileId;
    }, [user, profileId]);

    useEffect(() => {
        setAvatarUrl(getImageUrl(user?.avatar));
    }, [user?.avatar]);

    const toForm = (u) => ({
        username: u?.username || "",
        phone: u?.phone || "",
        country: u?.country || "Vietnam",
        bio: u?.bio || "",
        customerProfile: {
            name: u?.customerProfile?.name || "",
            address: u?.customerProfile?.address || "",
        },
        shipperProfile: {
            assignedHub: u?.shipperProfile?.assignedHub || "",
        },
    });

    const [form, setForm] = useState(toForm(user));
    const [editingProfile, setEditingProfile] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm(toForm(user));
    }, [user]);

    useEffect(() => {
        return () => {
            if (previewAvatar) URL.revokeObjectURL(previewAvatar);
        };
    }, [previewAvatar]);

    const err = (k) => errors[k];

    if (!user) return <div className="container-xl py-4">Loading profile…</div>;

    const validateProfile = (f) => {
        const e = {};
        const t = (s) => String(s ?? "").trim();

        // Phone (optional): if filled, must be a valid VN phone
        if (isFilled(f.phone) && !isValidPhone(t(f.phone)))
            e["phone"] =
                "Invalid phone. Use VN format (0/ +84 + carrier + 8 digits).";

        // Country: required
        if (!isFilled(f.country)) e["country"] = "Country is required.";

        // Bio: max 200 chars
        if (t(f.bio).length > 200)
            e["bio"] = "Bio must be at most 200 characters.";

        // Role-specific
        if (user.role === "customer") {
            if (!minLength(f.customerProfile?.name, 5)) {
                e["customerProfile.name"] =
                    "Customer name is required (min 5 characters).";
            }
            if (!minLength(f.customerProfile?.address, 5)) {
                e["customerProfile.address"] =
                    "Customer address is required (min 5 characters).";
            }
        }

        if (user.role === "shipper") {
            const hub =
                typeof f.shipperProfile?.assignedHub === "object"
                    ? f.shipperProfile?.assignedHub?._id ||
                      f.shipperProfile?.assignedHub?.name
                    : f.shipperProfile?.assignedHub;
            if (!isFilled(hub)) {
                e["shipperProfile.assignedHub"] = "Assigned hub is required.";
            }
        }

        return e;
    };

    const saveProfile = async () => {
        if (!isOwner) return;
        const nextErrors = validateProfile(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        setSaving(true);
        try {
            const payload = {
                phone: form.phone,
                country: form.country,
                bio: form.bio,
            };
            if (user?.role === "customer")
                payload.customerProfile = form.customerProfile;
            if (user?.role === "shipper")
                payload.shipperProfile = form.shipperProfile;

            await apiUtils.patch("/user/updateUserProfile", payload);
            setEditingProfile(false);
            setErrors({});
        } catch (err) {
            const apiErr = err?.response?.data;
            setErrors((prev) => ({
                ...prev,
                __api: apiErr?.message || "Failed to update profile.",
                ...(apiErr?.errors || {}),
            }));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={`${styles["profile-page"]} ${styles.white}`}>
            <div className="container-xl py-4">
                {/* Avatar */}
                <div className="text-center mb-3 position-relative">
                    <section className={styles.profileHeader}>
                        <Avatar
                            isOwner={isOwner}
                            url={avatarUrl}
                            className={styles.avatarWrap}
                            onSaveImage={(url) => setAvatarUrl(url)}
                        />
                        <div className={styles["username-bar"]}>
                            <span className={styles["username-text"]}>
                                {form.username || "User"}
                            </span>
                        </div>
                    </section>
                </div>

                {/* Profile info */}
                <div className={styles["profile-sheet"]}>
                    <div className={styles["profile-card__header"]}>
                        <h5 className="mb-0">Profile Information</h5>

                        {!editingProfile ? (
                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    className={styles["edit-btn"]}
                                    onClick={() =>
                                        isOwner && setEditingProfile(true)
                                    }
                                    disabled={!isOwner}
                                >
                                    Edit information
                                </button>
                            </div>
                        ) : (
                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    className={styles["save-btn"]}
                                    onClick={saveProfile}
                                    disabled={saving}
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className={styles["cancel-btn"]}
                                    onClick={() => {
                                        setEditingProfile(false);
                                        setForm(toForm(user));
                                        setErrors({});
                                    }}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className={styles["sheet-row"]}>
                        <label className={styles["label"]}>Email</label>
                        <input
                            type="email"
                            className="form-control form-control-sm"
                            value={user.email}
                            readOnly
                        />
                    </div>

                    {/* Role */}
                    <div className={styles["sheet-row"]}>
                        <label className={styles["label"]}>Role</label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            value={user.role}
                            readOnly
                        />
                    </div>

                    {/* Member Since */}
                    <div className={styles["sheet-row"]}>
                        <label className={styles["label"]}>Member Since</label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            value={new Date(user.createdAt).toLocaleDateString()}
                            readOnly
                        />
                    </div>

                    {/* Phone */}
                    <div className={styles["sheet-row"]}>
                        <label className={styles["label"]}>Phone</label>
                        <input
                            type="tel"
                            className="form-control form-control-sm"
                            value={form.phone}
                            onChange={(e) =>
                                setForm({ ...form, phone: e.target.value })
                            }
                            disabled={!editingProfile}
                        />
                        {err("phone") && (
                            <div className="invalid-feedback d-block">
                                {err("phone")}
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    <div className={styles["sheet-row"]}>
                        <label className={styles["label"]}>Bio</label>
                        <textarea
                            className="form-control form-control-sm"
                            rows={3}
                            maxLength={200}
                            value={form.bio}
                            onChange={(e) =>
                                setForm({ ...form, bio: e.target.value })
                            }
                            disabled={!editingProfile}
                        />
                        {err("bio") && (
                            <div className="invalid-feedback d-block">
                                {err("bio")}
                            </div>
                        )}
                    </div>

                    {/* Customer */}
                    {user.role === "customer" && (
                        <>
                            <div className={styles["sheet-row"]}>
                                <label className={styles["label"]}>
                                    Customer Name
                                </label>
                                <input
                                    className="form-control form-control-sm"
                                    value={form.customerProfile?.name || ""}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            customerProfile: {
                                                ...(prev.customerProfile || {}),
                                                name: e.target.value,
                                            },
                                        }))
                                    }
                                    disabled={!editingProfile}
                                />
                                {err("customerProfile.name") && (
                                    <div className="invalid-feedback d-block">
                                        {err("customerProfile.name")}
                                    </div>
                                )}
                            </div>

                            <div className={styles["sheet-row"]}>
                                <label className={styles["label"]}>
                                    Customer Address
                                </label>
                                <input
                                    className="form-control form-control-sm"
                                    value={form.customerProfile?.address || ""}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            customerProfile: {
                                                ...(prev.customerProfile || {}),
                                                address: e.target.value,
                                            },
                                        }))
                                    }
                                    disabled={!editingProfile}
                                />
                                {err("customerProfile.address") && (
                                    <div className="invalid-feedback d-block">
                                        {err("customerProfile.address")}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Shipper */}
                    {user.role === "shipper" && (
                        <div className={styles["sheet-row"]}>
                            <label className={styles["label"]}>
                                Assigned Hub
                            </label>
                            <input
                                className="form-control form-control-sm"
                                value={
                                    typeof form.shipperProfile?.assignedHub ===
                                    "object"
                                        ? form.shipperProfile?.assignedHub
                                              ?.name ||
                                          form.shipperProfile?.assignedHub
                                              ?._id ||
                                          ""
                                        : form.shipperProfile?.assignedHub || ""
                                }
                                readOnly
                            />
                            {err("shipperProfile.assignedHub") && (
                                <div className="invalid-feedback d-block">
                                    {err("shipperProfile.assignedHub")}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Country */}
                    <div className={styles["sheet-row"]}>
                        <label className={styles["label"]}>Country</label>
                        <input
                            className="form-control form-control-sm"
                            value={form.country}
                            onChange={(e) =>
                                setForm({ ...form, country: e.target.value })
                            }
                            disabled={!editingProfile}
                        />
                        {err("country") && (
                            <div className="invalid-feedback d-block">
                                {err("country")}
                            </div>
                        )}
                    </div>

                    {errors.__api && editingProfile && (
                        <div
                            className="alert alert-danger py-2 mt-2"
                            role="alert"
                        >
                            {errors.__api}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
