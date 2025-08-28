import React, { useMemo, useRef, useState, useEffect } from "react";
import styles from "./Malls.module.scss"; // switched to CSS module
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import adidas from "../../assets/malls_imgs/adidas.jpg";
import comfort from "../../assets/malls_imgs/comfort.jpg";
import coolmate from "../../assets/malls_imgs/coolmate.jpg";
import eyeware from "../../assets/malls_imgs/eyeware.jpg";
import locknlock from "../../assets/malls_imgs/locknlock.jpg";
import samsung from "../../assets/malls_imgs/samsung.jpg";
import vinmac from "../../assets/malls_imgs/vinmac.jpg";
import longway from "../../assets/malls_imgs/longway.jpg";
import poster_sale from "../../assets/malls_imgs/poster_sale.jpg";
import { apiUtils } from "../../utils/newRequest";

const BRANDS = [
    { name: "Vinmac", img: vinmac },
    { name: "Samsung", img: samsung },
    { name: "CoolMate", img: coolmate },
    { name: "Adidas", img: adidas },
    { name: "Comfort", img: comfort },
    { name: "Longway", img: longway },
    { name: "Eyeware", img: eyeware },
    { name: "Locknlock", img: locknlock },
];

export default function Malls() {

	const [brands, setBrands] = useState([]);

	useEffect(() => {
		// Simulate fetching data from an API
		const fetchBrands = async () => {
			try {
				const response = await apiUtils.get('/user/readBrands') // Replace with your API endpoint
				console.log(response.data.metadata.brands);
				setBrands(response.data.metadata.brands); // Adjust based on your API response structure
			} catch (error) {
				console.error("Error fetching brands:", error);
			}
		};
		fetchBrands();
	}, []);

    const pages = useMemo(() => {
        const chunk = 8;
        const out = [];
        for (let i = 0; i < brands?.length; i += chunk)
            out.push(brands?.slice(i, i + chunk));
        return out.length ? out : [[]];
    }, []);

    const rail = useRef(null);
    const [page, setPage] = useState(0);

    const toPage = (p) => {
        const el = rail.current;
        if (!el) return;
        const clamped = Math.max(0, Math.min(p, pages.length - 1));
        setPage(clamped);
        el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    };

    const next = () => toPage(page + 1);
    const prev = () => toPage(page - 1);

    useEffect(() => {
        const el = rail.current;
        if (!el) return;
        const onScroll = () => {
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== page) setPage(i);
        };
        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, [page]);

    return (
        <section className={`${styles.mall} ${styles.container}`} id="mall">
            <h2>Malls</h2>

            <div className={styles.mall__layout}>
                {/* Poster */}
                <aside className={styles.mall__poster}>
                    <img src={poster_sale} alt="Super Sale" />
                </aside>

                {/* Carousel brand */}
                <div className={styles.mall__carousel}>
                    <div className={styles.mall__viewport}>
                        <div
                            className={styles.mall__rail}
                            ref={rail}
                            style={{ width: `${pages.length * 100}%` }}
                        >
                            {pages.map((group, idx) => (
                                <div
                                    className={styles.mall__page}
                                    key={idx}
                                    style={{ width: `${100 / pages.length}%` }}
                                >
                                    <div className={styles.mall__grid}>
                                        {/* Link to pages: shops/malls */}
                                        {group.map((b, i) => (
                                            <article
                                                className={styles["brand-card"]}
                                                key={b.name + i}
                                            >
                                                <div
                                                    className={
                                                        styles["brand-thumb"]
                                                    }
                                                >
                                                    <img
                                                        src={b.img}
                                                        alt={b.name}
                                                    />
                                                </div>
                                                <div
                                                    className={
                                                        styles["brand-chip"]
                                                    }
                                                >
                                                    {b.name}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className={`${styles["mall-nav"]} ${styles.left} ${
                                page === 0 ? styles.disabled : ""
                            }`}
                            onClick={prev}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <button
                            className={`${styles["mall-nav"]} ${styles.right} ${
                                page === pages.length - 1 ? styles.disabled : ""
                            }`}
                            onClick={next}
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>

                    <div className={styles.mall__dots}>
                        {pages.map((_, i) => (
                            <button
                                key={i}
                                className={`${styles.dot} ${
                                    page === i ? styles.active : ""
                                }`}
                                onClick={() => toPage(i)}
                                aria-label={`Go to page ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
