import React, { useEffect, useState } from "react";
import styles from "./Malls.module.scss";
import poster_sale from "../../assets/malls_imgs/poster_sale.jpg";
import locknlock from "../../assets/malls_imgs/locknlock.jpg"; // fallback image
import { apiUtils } from "../../utils/newRequest";
import { getImageUrl } from "../../utils/imageUrl";

export default function Malls() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const res = await apiUtils.get("/user/readBrands");
                const users =
                    res?.data?.metadata?.users ||
                    res?.data?.metadata?.brands ||
                    [];
                if (!alive) return;
                setVendors(Array.isArray(users) ? users : []);
            } catch (e) {
                console.error("Error fetching brands:", e);
                if (alive) setVendors([]);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    return (
        <section className={`${styles.mall} ${styles.container}`} id="mall">
            <h2>Malls</h2>

            <div className={styles.mall__layout}>
                {/* Poster */}
                <aside className={styles.mall__poster}>
                    <img src={poster_sale} alt="Super Sale" />
                </aside>

                {/* Simple grid (no pagination) */}
                <div className={styles.mall__grid}>
                    {loading && <div style={{ padding: 12 }}>Loading…</div>}
                    {!loading && vendors.length === 0 && (
                        <div style={{ padding: 12, opacity: 0.7 }}>
                            No brands found.
                        </div>
                    )}

                    {vendors.map((b) => {
                        const displayName =
                            b?.vendorProfile?.businessName ||
                            b?.fullName ||
                            b?.username ||
                            (b?.email ? b.email.split("@")[0] : "Vendor");

                        const avatarSrc = getImageUrl(b?.avatar);

                        return (
                            <article
                                className={styles["brand-card"]}
                                key={b?._id || displayName}
                            >
                                <div className={styles["brand-thumb"]}>
                                    <img
                                        src={avatarSrc}
                                        alt={displayName}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = locknlock; // local fallback
                                        }}
                                    />
                                </div>
                                <div className={styles["brand-chip"]}>
                                    {displayName}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
