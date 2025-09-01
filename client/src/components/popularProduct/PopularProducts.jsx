import React, { useEffect, useState } from "react";
import styles from "./PopularProducts.module.scss"; // switched to CSS module
import { Link } from "react-router-dom";
import { apiUtils } from "../../utils/newRequest";

export default function PopularProducts() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await apiUtils.get("/product/readProducts"); // Adjust the path as necessary
				console.log(response.data.metadata.products);
                setProducts(response.data.metadata.products);
            } catch (error) {
                console.error("Error fetching popular products:", error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <section
            className={`${styles.popular} ${styles.container}`}
            id="popular"
        >
            <h2>Popular Products</h2>

            <div className={styles["popular-grid"]}>
                {/* Link to product:id */}
                {products.map((p) => (
                    <Link
                        to={`/product/${p.id}`}
                        key={p.id}
                        className={styles["pop-card"]}
                    >
                        <article>
                            <div className={styles.thumb}>
								<img src={p.images?.[0]} alt={p.title} loading="lazy" />
                            </div>
                            <div className={styles.info}>
                                <h3 title={p.title}>{p.title}</h3>
                                <p className={styles.desc} title={p.description}>
                                    {p.description}
                                </p>
                                <span className={styles["price-link"]}>
                                    {p.price}
                                </span>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </section>
    );
}
