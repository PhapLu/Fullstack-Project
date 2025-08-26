import React, { useEffect, useState, useMemo } from 'react';
import styles from '../banner/Banner.module.scss';   // changed to CSS module
import camBanner from "../../assets/banner_imgs/camera.png";
import headPhone from "../../assets/banner_imgs/headphone.png";
import shoes_sport from "../../assets/banner_imgs/shoes_sport.png"

const Banner = () => {
  const slides = useMemo(() => [
    {
      id: 1,
      title: <>Capture your world<br/>in motion: Zosmo</>,
      desc: <>Zosmo places a big sale! Save up to<br/>50% off on your first order</>,
      img: camBanner,
      bg: "radial-gradient(120% 160% at 70% 0%, #d9e9ff 0%, #e9f1ff 35%, #ffffff 100%)",
    },
    {
      id: 2,
      title: <>Sound that moves you</>,
      desc: <>Premium headphones — immersive bass,<br/>lightweight comfort.</>,
      img: headPhone,
      bg: "radial-gradient(120% 160% at 70% 0%, #e7f7ef 0%, #d9f6ff 40%, #ffffff 100%)",
    },
    {
      id: 3,
      title: <>Level up your fitness</>,
      desc: <>Smartwatch deals up to 40% off.<br/>Track more, worry less.</>,
      img: shoes_sport,
      bg: "radial-gradient(120% 160% at 70% 0%, #ffe9ef 0%, #ffeecf 40%, #ffffff 100%)",
    },
  ], []);

  const [idx, setIdx] = useState(0);
  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  // Auto-play
  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  });

  const s = slides[idx];

  return (
    <section className={`${styles.banner} ${styles.container}`}>
      <button className={`${styles["banner-arrow"]} ${styles.left}`} onClick={prev} aria-label="Previous">‹</button>

      <div className={`${styles["banner-card"]} ${styles.fade}`} style={{ background: s.bg }}>
        <div className={styles["banner-copy"]}>
          <h1>{s.title}</h1>
          <p>{s.desc}</p>
        </div>
        <div className={styles["banner-media"]}>
          <img key={s.id} src={s.img} alt="hero" />
        </div>
      </div>

      <button className={`${styles["banner-arrow"]} ${styles.right}`} onClick={next} aria-label="Next">›</button>

      {/* Dots */}
      <div className={styles["banner-dots"]} role="tablist" aria-label="slides">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === idx ? styles.active : ""}`}
            onClick={() => setIdx(i)}
            aria-selected={i === idx}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default Banner;
