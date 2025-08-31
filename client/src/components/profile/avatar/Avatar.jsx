import React, { useEffect, useRef, useState } from "react";
import styles from "../../../pages/profile/vendorProfile/VendorProfile.module.scss";
import { apiUtils } from "../../../utils/newRequest";

export default function Avatar({ url, onSaveImage }) {
    const inputRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(url || "");
    const [uploading, setUploading] = useState(false);

    useEffect(() => setImgSrc(url || ""), [url]);

    const pick = () => inputRef.current?.click();

    const onChange = async (e) => {
        const file = e.target.files?.[0];
        // allow re-selecting the same file next time
        e.target.value = "";
        if (!file) return;

        try {
            setUploading(true);
            const form = new FormData();
            form.append("file", file);

            const { data } = await apiUtils.patch("/user/uploadAvatar", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const newUrl =
                data?.metadata?.avatar || data?.avatar || data?.url || imgSrc;

            setImgSrc(newUrl);
            onSaveImage?.(newUrl);
        } catch (err) {
            console.error("Upload avatar failed:", err);
            // TODO: show a toast/snackbar if you have one
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            className={styles["avatar-wrap"]}
            aria-busy={uploading || undefined}
        >
            <div className={styles.avatar}>
                {imgSrc ? (
                    <img
                        src={imgSrc}
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
                title={uploading ? "Uploading..." : "Edit"}
                type="button"
                disabled={uploading}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="21px"
                    viewBox="0 -960 960 960"
                    width="21px"
                    fill="#00000"
                >
                    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z" />
                </svg>
            </button>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onChange}
            />
        </div>
    );
}
