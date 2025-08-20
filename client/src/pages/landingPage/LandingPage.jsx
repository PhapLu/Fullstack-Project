import React, { useEffect, useMemo, useState } from "react";
import "./LandingPage.css";

import camBanner from "../../assets/banner_imgs/camera.png";
import headPhone from "../../assets/banner_imgs/headphone.png";
import shoes_sport from "../../assets/banner_imgs/shoes_sport.png"

import babies from "../../assets/features_imgs/babies.png";
import beauty from "../../assets/features_imgs/beauty.png";
import books from "../../assets/features_imgs/books.png";
import camera from "../../assets/features_imgs/camera.png";
import electrics from "../../assets/features_imgs/electrics.png";
import fruits from "../../assets/features_imgs/fruits.png";
import headphone from "../../assets/features_imgs/headphone.png";
import hand_bag from "../../assets/features_imgs/hand_bag.png";
import high_heels from "../../assets/features_imgs/high_heels.png";
import jewelry from "../../assets/features_imgs/jewelry.png";
import kettle from "../../assets/features_imgs/kettle.png";
import men from "../../assets/features_imgs/men.png";
import shoes from "../../assets/features_imgs/shoes.png";
import sport from "../../assets/features_imgs/sport.png";
import watch from "../../assets/features_imgs/watch.png";
import women from "../../assets/features_imgs/women.png";

function Banner() {
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

  // Auto-play (tuỳ chọn)
  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  });

  const s = slides[idx];

  return (
    <section className="banner container">
      <button className="banner-arrow left" onClick={prev} aria-label="Previous">‹</button>

      <div className="banner-card fade" style={{ background: s.bg }}>
        <div className="banner-copy">
          <h1>{s.title}</h1>
          <p>{s.desc}</p>
        </div>
        <div className="banner-media">
          <img key={s.id} src={s.img} alt="hero" />
        </div>
      </div>

      <button className="banner-arrow right" onClick={next} aria-label="Next">›</button>

      {/* Dots */}
      <div className="banner-dots" role="tablist" aria-label="slides">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === idx ? "active" : ""}`}
            onClick={() => setIdx(i)}
            aria-selected={i === idx}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

const categories = [
  { img: men,     tone: "tone-1" },
  { img: camera,      tone: "tone-2" },
  { img: beauty,      tone: "tone-3" },
  { img: babies,        tone: "tone-4" },
  { img: hand_bag,         tone: "tone-5" },
  { img: watch,       tone: "tone-6" },
  { img: kettle,     tone: "tone-7" },
  { img: books,       tone: "tone-8" },
  { img: electrics,       tone: "tone-9" },
  { img: women,     tone: "tone-10"},
  { img: shoes,       tone: "tone-11"},
  { img: jewelry,     tone: "tone-12"},
  { img: fruits,      tone: "tone-13"},
  { img: sport,        tone: "tone-14"},
  { img: high_heels,       tone: "tone-15"},
  { img: headphone,   tone: "tone-16"},
];

export default function LandingPage() {
  return (
    <>
      {/* Banner */}
        <Banner/>
      {/* Featured Categories */}
    <section className="categories container" id="categories">
        <h2>Featured Categories</h2>

        <div className="categories-grid">
          {categories.map((c, i) => (
            <a key={i} className={`cat-card ${c.tone}`} href="#">
              <div className="cat-thumb">
                <img src={c.img} alt={c.title} loading="lazy" />
              </div>
            </a>
          ))}
        </div>
    </section>
    </>
  );
}
