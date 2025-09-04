import React, { useEffect, useState } from "react";
import styles from "./PopularProducts.module.scss";
import { Link } from "react-router-dom";
import { apiUtils } from "../../utils/newRequest";
import { getImageUrl } from "../../utils/imageUrl";
import { Pagination } from "./Pagination";
import { usd } from "../../utils/currency";

export default function PopularProducts() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(6);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiUtils.get("/product/readProducts");
        setProducts(response.data.metadata.products);
      } catch (error) {
        console.error("Error fetching popular products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Change page of pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <section className={`${styles.popular} ${styles.container}`} id="popular">
      <h2>Popular Products</h2>

      <div className={styles["popular-grid"]}>
        {/* Link to product:id */}
        {currentProducts.map((p) => (
          <Link
            to={`/product/${p._id}`}
            key={p._id}
            className={styles["pop-card"]}
          >
            <article>
              <div className={styles.thumb}>
                <img
                  src={getImageUrl(p.images[0])}
                  alt={p.title}
                  loading="lazy"
                />
              </div>
              <div className={styles.info}>
                <h3 title={p.title}>{p.title}</h3>
                <p className={styles.desc} title={p.description}>
                  {p.description}
                </p>
                <div className={styles.info__bottom}>
                  <span className={styles["price-link"]}>{usd(p.price)}</span>
                  <span className={styles["stock-link"]}>
                    In stock: {p.stock}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
      <Pagination
        productsPerPage={productsPerPage}
        totalProducts={products.length}
        paginate={paginate}
      />
    </section>
  );
}
