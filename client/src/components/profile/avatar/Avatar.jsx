import React, { useEffect, useRef, useState } from "react";
// import styles from "../../../pages/profile/vendorProfile/VendorProfile.module.scss";
import styles from "./Avatar.module.scss";
import { apiUtils } from "../../../utils/newRequest";
import { getImageUrl } from "../../../utils/imageUrl";

const bust = (u) =>
    u ? `${u}${u.includes("?") ? "&" : "?"}v=${Date.now()}` : "";

export default function Avatar({ url, onSaveImage }) {
    const inputRef = useRef(null);
    const imgElRef = useRef(null);
    const prevUrlRef = useRef("");

    const [imgSrc, setImgSrc] = useState(url ? bust(getImageUrl(url)) : "");
    const [uploading, setUploading] = useState(false);

    // When parent updates url (only when not uploading)
    useEffect(() => {
        if (uploading) return;
        const abs = getImageUrl(url);
        if (abs && abs !== prevUrlRef.current) {
            setImgSrc(bust(abs));
            prevUrlRef.current = abs;
        }
    }, [url, uploading]);

    const pick = () => inputRef.current?.click();

    const onChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        let localPreview;
        try {
            setUploading(true);

            localPreview = URL.createObjectURL(file);
            setImgSrc(localPreview);

            const form = new FormData();
            form.append("file", file);
            const { data } = await apiUtils.patch("/user/uploadAvatar", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const raw = data?.metadata?.avatar || data?.avatar || data?.url;
            const abs = getImageUrl(raw);

            setImgSrc(bust(abs));
            prevUrlRef.current = abs;

            onSaveImage?.(abs); // tell parent immediately
        } catch (err) {
            console.error("[Avatar] Upload failed:", err);
            setImgSrc(prevUrlRef.current ? bust(prevUrlRef.current) : "");
        } finally {
            if (localPreview && imgElRef.current?.src !== localPreview) {
                URL.revokeObjectURL(localPreview);
            }
            setUploading(false);
        }
    };

    const handleImgError = (e) => {
        // Image load failed: print the exact broken URL and who initiated it
        const broken = e?.currentTarget?.src;
        console.error("[Avatar] <img> onError — failed URL:", broken);
        // Optional: fallback
        const fallback = getImageUrl("/default-avatar.png");
        if (broken !== fallback) setImgSrc(fallback);
    };

    return (
        <div
            className={styles["avatar-wrap"]}
            aria-busy={uploading || undefined}
        >
            <div className={styles.avatar}>
                {imgSrc ? (
                    <img
                        ref={imgElRef}
                        key={imgSrc}
                        src={imgSrc}
                        alt="Avatar"
                        className={styles["avatar-img"]}
                        onError={handleImgError}
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
                type="button"
                disabled={uploading}
                title={uploading ? "Uploading..." : "Edit"}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="21"
                    viewBox="0 -960 960 960"
                    width="21"
                    fill="#000000"
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
