import { useRef, useState, useEffect } from "react";
import styles from "./ShipperProfile.module.scss";

const STORAGE_USER = "bm_shipper_user";
const STORAGE_AVATAR = "bm_shipper_avatar";

const DEFAULT_USER = {
    firstName: "Shipper",
    lastName: "Name",
    phone: "+84 900 000 000",
    gender: "male",
    dob: "1995-01-01",
    address: {
        hubName: "Bến Nghé", // chỉ tên hub
        zip: "700000",
    },
};

export default function ShipperProfile() {
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_USER);
            const saved = raw ? JSON.parse(raw) : null;

            const hubFromOld = [saved?.address?.ward, saved?.address?.city]
                .filter(Boolean)
                .join(", ");

            const hubName =
                (saved?.address?.hubName ?? hubFromOld) ||
                DEFAULT_USER.address.hubName;

            return {
                ...DEFAULT_USER,
                ...saved,
                address: {
                    ...DEFAULT_USER.address,
                    ...saved?.address,
                    hubName,
                },
            };
        } catch {
            return DEFAULT_USER;
        }
    });

    // ---- Avatar ----
    const [avatar, setAvatar] = useState(
        () => localStorage.getItem(STORAGE_AVATAR) || ""
    );
    useEffect(() => {
        localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    }, [user]);

    const fileRef = useRef(null);
    const onPickAvatar = () => fileRef.current?.click();
    const onFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = () => {
            const dataUrl = String(r.result || "");
            setAvatar(dataUrl);
            localStorage.setItem(STORAGE_AVATAR, dataUrl);
        };
        r.readAsDataURL(f);
    };

    // ---- Edit mode ----
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(user);

    const startEdit = () => {
        setForm({
            ...user,
            dob: (user.dob || "").substring(0, 10),
            address: {
                hubName: user.address?.hubName || "",
                zip: user.address?.zip || "",
                ...user.address,
            },
        });
        setEditing(true);
    };

    const saveEdit = (e) => {
        e?.preventDefault?.();
        setUser(form);
        setEditing(false);
    };

    const cancelEdit = () => {
        setEditing(false);
        setForm(user);
    };

    return (
        <div className={`${styles["profile-page"]} ${styles.white}`}>
            <div className="container-xl py-4">
                <div className={`text-center mb-2 ${styles["hero-name"]}`}>
                    {(user.firstName || "User") +
                        " " +
                        (user.lastName || "Name")}
                </div>

                <div className="text-center mb-3">
                    <div
                        className={`${styles["avatar-hero"]} mx-auto`}
                        role="img"
                        aria-label="User avatar"
                    >
                        {avatar ? (
                            <img src={avatar} alt="" />
                        ) : (
                            <svg
                                viewBox="0 0 24 24"
                                width="96"
                                height="96"
                                aria-hidden
                            >
                                <path
                                    fill="#5b6cff"
                                    d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5.5A1.5 1.5 0 0 0 4.5 21h15A1.5 1.5 0 0 0 21 19.5C21 16.5 17 14 12 14Z"
                                />
                            </svg>
                        )}
                        <button
                            type="button"
                            className={styles["avatar-pen-btn"]}
                            onClick={onPickAvatar}
                            aria-label="Change avatar"
                            title="Change avatar"
                        >
                            ✎
                        </button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className={styles["visually-hidden"]}
                            onChange={onFile}
                        />
                    </div>
                </div>

                <div className={styles["sheet-tab"]}>Profile</div>
                <div className={styles["profile-sheet"]}>
                    {/* Contact Name */}
                    <div className={styles["sheet-row"]}>
                        <div className={styles["label"]}>Contact Name:</div>

                        <div className={styles["col-2"]}>
                            <div className={styles["sub"]}>First name</div>
                            {!editing ? (
                                <div className={styles["value"]}>
                                    {user.firstName}
                                </div>
                            ) : (
                                <input
                                    className={`form-control form-control-sm ${styles["form-control-sm"]}`}
                                    value={form.firstName}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            firstName: e.target.value,
                                        })
                                    }
                                />
                            )}
                        </div>

                        <div className={styles["col-2"]}>
                            <div className={styles["sub"]}>Last name</div>
                            {!editing ? (
                                <div className={styles["value"]}>
                                    {user.lastName}
                                </div>
                            ) : (
                                <input
                                    className={`form-control form-control-sm ${styles["form-control-sm"]}`}
                                    value={form.lastName}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            lastName: e.target.value,
                                        })
                                    }
                                />
                            )}
                        </div>
                    </div>

                    {/* Contact Number */}
                    <div className={styles["sheet-row"]}>
                        <div className={styles["label"]}>Contact Number:</div>
                        {!editing ? (
                            <div className={styles["value"]}>{user.phone}</div>
                        ) : (
                            <input
                                className={`form-control form-control-sm w-auto ${styles["form-control-sm"]}`}
                                value={form.phone}
                                onChange={(e) =>
                                    setForm({ ...form, phone: e.target.value })
                                }
                            />
                        )}
                    </div>

                    {/* Gender */}
                    <div className={styles["sheet-row"]}>
                        <div className={styles["label"]}>Gender</div>
                        {!editing ? (
                            <div
                                className={`${styles["value"]} ${styles["radios"]}`}
                            >
                                <label>
                                    <input
                                        type="radio"
                                        checked={user.gender === "male"}
                                        readOnly
                                    />{" "}
                                    Male
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        checked={user.gender === "female"}
                                        readOnly
                                    />{" "}
                                    Female
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        checked={user.gender === "other"}
                                        readOnly
                                    />{" "}
                                    Other
                                </label>
                            </div>
                        ) : (
                            <div
                                className={`${styles["value"]} ${styles["radios"]}`}
                            >
                                <label>
                                    <input
                                        type="radio"
                                        name="gender"
                                        checked={form.gender === "male"}
                                        onChange={() =>
                                            setForm({ ...form, gender: "male" })
                                        }
                                    />{" "}
                                    Male
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="gender"
                                        checked={form.gender === "female"}
                                        onChange={() =>
                                            setForm({
                                                ...form,
                                                gender: "female",
                                            })
                                        }
                                    />{" "}
                                    Female
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="gender"
                                        checked={form.gender === "other"}
                                        onChange={() =>
                                            setForm({
                                                ...form,
                                                gender: "other",
                                            })
                                        }
                                    />{" "}
                                    Other
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div className={styles["sheet-row"]}>
                        <div className={styles["label"]}>Date of Birth</div>
                        {!editing ? (
                            <div className={styles["value"]}>
                                {user.dob
                                    ? new Date(user.dob).toLocaleDateString(
                                          "vi-VN"
                                      )
                                    : "dd/mm/yyyy"}
                            </div>
                        ) : (
                            <input
                                type="date"
                                className={`form-control form-control-sm w-auto ${styles["form-control-sm"]}`}
                                value={form.dob}
                                onChange={(e) =>
                                    setForm({ ...form, dob: e.target.value })
                                }
                            />
                        )}
                    </div>

                    {/* Distribution Hub */}
                    <div className={styles["sheet-row"]}>
                        <div className={styles["label"]}>Distribution Hub:</div>
                        {!editing ? (
                            <div className={styles["value"]}>
                                {user.address?.hubName || "—"}
                            </div>
                        ) : (
                            <input
                                className={`form-control form-control-sm ${styles["form-control-sm"]}`}
                                value={form.address?.hubName || ""}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        address: {
                                            ...form.address,
                                            hubName: e.target.value,
                                        },
                                    })
                                }
                            />
                        )}
                    </div>

                    {/* Zip/Postal code */}
                    <div className={styles["sheet-row"]}>
                        <div className={styles["label"]}>Zip/Postal code:</div>
                        {!editing ? (
                            <div className={styles["value"]}>
                                {user.address?.zip || ""}
                            </div>
                        ) : (
                            <input
                                className={`form-control form-control-sm w-auto ${styles["form-control-sm"]}`}
                                value={form.address?.zip || ""}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        address: {
                                            ...form.address,
                                            zip: e.target.value,
                                        },
                                    })
                                }
                            />
                        )}
                    </div>

                    <div
                        className={`${styles["actions-bottom"]} d-flex justify-content-end`}
                    >
                        {!editing ? (
                            <button
                                className="btn btn-outline-primary"
                                onClick={startEdit}
                            >
                                Edit information
                            </button>
                        ) : (
                            <>
                                <button
                                    className="btn btn-primary"
                                    onClick={saveEdit}
                                >
                                    Save
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={cancelEdit}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
