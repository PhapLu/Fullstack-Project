import React, { useEffect, useRef, useState } from "react";
import styles from "./HotDeals.module.scss"; // switched to CSS module
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

import sale_1 from "../../assets/hot_deals_imgs/sale 1.jpg";
import sale_2 from "../../assets/hot_deals_imgs/sale 2.jpg";
import sale_3 from "../../assets/hot_deals_imgs/sale 3.jpg";
import sale_4 from "../../assets/hot_deals_imgs/sale 4.jpg";
import sale_5 from "../../assets/hot_deals_imgs/sale 5.jpg";
import sale_6 from "../../assets/hot_deals_imgs/sale 6.jpg";
import { Link } from "react-router-dom";
import { apiUtils } from "../../utils/newRequest";

export default function HotDeals() {
    const railRef = useRef();
    const [hotdealProducts, setHotDealProducts] = useState([]);

    useEffect(() => {
        // Fetch hot deal products from your API
        const fetchHotDealProducts = async () => {
            try {
                const response = await apiUtils.get('/product/readProducts') // Replace with your API endpoint
                console.log(response.data.metadata.products);
                setHotDealProducts(response.data.metadata.products); // Adjust based on your API response structure
            } catch (error) {
                console.error("Error fetching hot deal products:", error);
            }
        };

        fetchHotDealProducts();
    }, [])

    // simple countdown (đếm về cuối ngày)
    const [clock, setClock] = useState("--:--:--");
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            const s = Math.max(
                0,
                Math.floor((end.getTime() - now.getTime()) / 1000)
            );
            const h = String(Math.floor(s / 3600)).padStart(2, "0");
            const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
            const _s = String(s % 60).padStart(2, "0");
            setClock(`${h}:${m}:${_s}`);
        };
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, []);

    const updateEnds = () => {
        const el = railRef.current;
        if (!el) return;
    };

    useEffect(() => {
        updateEnds();
        const el = railRef.current;
        if (!el) return;
        el.addEventListener("scroll", updateEnds, { passive: true });
        return () => el.removeEventListener("scroll", updateEnds);
    });

    return (
        <section
            className={`${styles.hotdeals} ${styles.container}`}
            id="deals"
        >
            <header className={styles.hotdeals__head}>
                <h2>Hot Deals</h2>
                <div className={styles.hotdeals__countdown}>
                    <span>Countdown time</span>
                    <strong className={styles.clock}>{clock}</strong>
                </div>
            </header>

            <div className={styles.hotdeals__viewport}>
                <div className={styles.hotdeals__rail} ref={railRef}>
                    {/* Link tới product/id ( Product Details ) */}
                    {hotdealProducts.map((p) => (
                        <Link
                            to={`/product/${p.id}`}
                            className={styles["deal-card"]}
                            key={p.id}
                        >
                            <article>
                                <div className={styles["deal-card__thumb"]}>
                                    <img src={p.image} alt="" />
                                </div>
                                <div className={styles["deal-card__bottom"]}>
                                    <FontAwesomeIcon icon={faFire} />
                                    <span className={styles.price}>
                                        {p.price}
                                    </span>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
