import React, { useEffect, useRef, useState } from "react";
import styles from "../../../pages/profile/vendorProfile/VendorProfile.module.scss";

export default function Avatar({ url, onSaveImage }) {
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
                    <img
                        src={showUrl}
                        alt="Avatar"
                        className={styles["avatar-img"]}
                    />
                ) : (
                    <svg
                        viewBox="0 0 512 512"
                        width="120"
                        height="120"
                        aria-hidden
                    >
                        <circle
                            cx="256"
                            cy="171"
                            r="96"
                            stroke="#6d28d9"
                            strokeWidth="28"
                            fill="none"
                        />
                        <path
                            d="M96 428c0-72 72-118 160-118s160 46 160 118"
                            stroke="#6d28d9"
                            strokeWidth="28"
                            strokeLinecap="round"
                            fill="none"
                        />
                    </svg>
                )}
            </div>

            <button
                className={`${styles["icon-btn"]} ${styles["avatar-edit"]}`}
                onClick={pick}
                title="Edit"
            >
                ✎
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onChange}
            />

            {preview && (
                <div className={styles["avatar-actions"]}>
                    <button
                        className={`${styles.btn} ${styles.ghost}`}
                        onClick={cancel}
                    >
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
