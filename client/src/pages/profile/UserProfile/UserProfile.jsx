import { useEffect, useState } from "react";
import styles from "./UserProfile.module.scss";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlices";
import { apiUtils } from "../../../utils/newRequest";
import Avatar from "../../../components/profile/avatar/Avatar";
import { getImageUrl } from "../../../utils/imageUrl";

const PHONE_RE = /^\d{0,10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserProfile() {
    const user = useSelector(selectUser);
    const [errors, setErrors] = useState({});
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
	const [avatarUrl, setAvatarUrl] = useState(getImageUrl(user?.avatar));

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
    const [editingAvatar, setEditingAvatar] = useState(false);
    const [editingUsername, setEditingUsername] = useState(false);
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

    /** ------------ Avatar ------------- */
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        const MAX = 2 * 1024 * 1024;
        if (file.size > MAX) {
            setErrors({ __api: "Max size 2MB" });
            return;
        }

        if (!file) return;

        setAvatarFile(file);
        const url = URL.createObjectURL(file);
        setPreviewAvatar(url);
    };

    const saveAvatar = async () => {
        if (!avatarFile) return;

        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("avatar", avatarFile);

            await apiUtils.patch("/user/updateUserProfile", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setEditingAvatar(false);
            setAvatarFile(null);
            setErrors({});
        } catch (err) {
            const apiErr = err?.response?.data;
            setErrors((prev) => ({
                ...prev,
                __api: apiErr?.message || "Failed to update avatar.",
                ...(apiErr?.errors || {}),
            }));
        } finally {
            setSaving(false);
        }
    };

    /** ------------ Username ------------- */
    const saveUsername = async () => {
        if (!form.username.trim()) {
            setErrors({ username: "Username is required." });
            return;
        }
        setSaving(true);
        try {
            await apiUtils.patch("/user/updateUserProfile", {
                username: form.username,
            });
            setEditingUsername(false);
            setErrors({});
        } catch (err) {
            const apiErr = err?.response?.data;
            setErrors((prev) => ({
                ...prev,
                __api: apiErr?.message || "Failed to update username.",
                ...(apiErr?.errors || {}),
            }));
        } finally {
            setSaving(false);
        }
    };

    /** ------------ Profile info ------------- */
    const validateProfile = (f) => {
        const e = {};
        const t = (s) => String(s || "").trim();
        if (t(f.phone) && !PHONE_RE.test(t(f.phone)))
            e["phone"] = "Phone contains invalid characters.";
        if (!EMAIL_RE.test(form.email)) {
            setErrors({ email: "Invalid email address." });
        }
        if (!t(f.country)) e["country"] = "Country is required.";
        if (t(f.bio).length > 200)
            e["bio"] = "Bio must be at most 200 characters.";
        if (user.role === "customer") {
            if (!t(f.customerProfile?.name))
                e["customerProfile.name"] = "Customer name is required.";
        }
        if (user.role === "shipper") {
            const hub =
                typeof f.shipperProfile?.assignedHub === "object"
                    ? f.shipperProfile?.assignedHub?._id ||
                      f.shipperProfile?.assignedHub?.name
                    : f.shipperProfile?.assignedHub;
            if (!t(hub))
                e["shipperProfile.assignedHub"] = "Assigned hub is required.";
        }
        return e;
    };

    const saveProfile = async () => {
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
                                    onClick={() => setEditingProfile(true)}
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

                    {/* Phone */}
                    <div className={styles["sheet-row"]}>
                        <label className={styles["label"]}>Phone</label>
                        <input
                            type="number"
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
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        shipperProfile: {
                                            ...(prev.shipperProfile || {}),
                                            assignedHub: e.target.value,
                                        },
                                    }))
                                }
                                disabled={!editingProfile}
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
