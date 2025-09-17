// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Tran Bao Tran
// ID: S3975175

import React from "react";
import styles from "../categories/Categories.module.scss";

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

const categories = [
  { img: men, tone: "tone-1" },
  { img: camera, tone: "tone-2" },
  { img: beauty, tone: "tone-3" },
  { img: babies, tone: "tone-4" },
  { img: hand_bag, tone: "tone-5" },
  { img: watch, tone: "tone-6" },
  { img: kettle, tone: "tone-7" },
  { img: books, tone: "tone-8" },
  { img: electrics, tone: "tone-9" },
  { img: women, tone: "tone-10" },
  { img: shoes, tone: "tone-11" },
  { img: jewelry, tone: "tone-12" },
  { img: fruits, tone: "tone-13" },
  { img: sport, tone: "tone-14" },
  { img: high_heels, tone: "tone-15" },
  { img: headphone, tone: "tone-16" },
];

const Categories = () => {
  return (
    <div>
      <section
        className={`${styles.categories} ${styles.container}`}
        id="categories"
      >
        <h2>Featured Categories</h2>

        <div className={styles["categories-grid"]}>
          {categories.map((c, i) => (
            <a
              key={i}
              className={`${styles["cat-card"]} ${styles[c.tone]}`}
              href="#"
            >
              <div className={styles["cat-thumb"]}>
                <img src={c.img} alt={c.title} loading="lazy" />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Categories;
