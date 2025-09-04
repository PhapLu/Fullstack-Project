import React, { useEffect, useRef, useState } from "react";
import styles from "./HotDeals.module.scss"; // switched to CSS module
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

import { Link } from "react-router-dom";
import { apiUtils } from "../../utils/newRequest";
import { getImageUrl } from "../../utils/imageUrl";
import { usd } from "../../utils/currency";

export default function HotDeals() {
  const railRef = useRef();
  const [hotdealProducts, setHotDealProducts] = useState([]);

  useEffect(() => {
    const fetchHotDealProducts = async () => {
      try {
        const response = await apiUtils.get("/product/readProducts");
        console.log(response.data.metadata.products);
        setHotDealProducts(response.data.metadata.products);
      } catch (error) {
        console.error("Error fetching hot deal products:", error);
      }
    };

    fetchHotDealProducts();
  }, []);

  const [clock, setClock] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
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
    <section className={`${styles.hotdeals} ${styles.container}`} id="deals">
      <header className={styles.hotdeals__head}>
        <h2>Hot Deals</h2>
        <div className={styles.hotdeals__countdown}>
          <span>Countdown time</span>
          <strong className={styles.clock}>{clock}</strong>
        </div>
      </header>

      <div className={styles.hotdeals__viewport}>
        <div className={styles.hotdeals__rail} ref={railRef}>
          {hotdealProducts.map((p) => (
            <Link
              to={`/product/${p._id}`}
              className={styles["deal-card"]}
              key={p._id}
            >
              <article>
                <div className={styles["deal-card__thumb"]}>
                  <img src={getImageUrl(p.images[0])} alt="" />
                </div>
                <div className={styles.info}>
                  <h3 title={p.title}>{p.title}</h3>
                  <p className={styles.desc} title={p.description}>
                    {p.description}
                  </p>
                  <div className={styles.info__bottom}>
                    <div className={styles.priceBlock}>
                      <FontAwesomeIcon icon={faFire} />
                      <span className={styles["price-link"]}>
                        {usd(p.price)}
                      </span>
                    </div>
                    <span className={styles["stock-link"]}>
                      In Stock: {p.stock}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
