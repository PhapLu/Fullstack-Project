import React from 'react';
import '../promo/Promo.css'


import promo_1 from "../../assets/promo_imgs/promo_1.png";
import promo_2 from "../../assets/promo_imgs/promo_2.png";
import promo_3 from "../../assets/promo_imgs/promo_3.png";

const Promo = () => {
    return (
        <div>
            <section className="promos container">
                <div className="promos-grid">
                    {[
                      {
                        title: "Everyday Fresh & Clean with Our Products",
                        img: promo_1, 
                        bg: "linear-gradient(135deg,#e6f0ff 0%,#f3e8ff 55%,#e9f6ff 100%)",
                      },
                      {
                        title: "Everyday Fresh & Clean with Our Products",
                        img: promo_2,
                        bg: "linear-gradient(135deg,#f3e8ff 0%,#e6f0ff 55%,#e9f6ff 100%)",
                      },
                      {
                        title: "Everyday Fresh & Clean with Our Products",
                        img: promo_3,
                        bg: "linear-gradient(135deg,#eaf2ff 0%,#f4e7ff 55%,#eef7ff 100%)",
                      },
                    ].map((p, i) => (
                      <article key={i} className="promo-card" style={{ background: p.bg }}>
                        <div className="promo-copy">
                          <h3>{p.title}</h3>
                        </div>
            
                        <div className="promo-media">
                          <img src={p.img} alt="" />
                        </div>
                      </article>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Promo;