// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Tran Bao Tran
// ID: S3975175

import React from "react";
import styles from "./Filter.module.scss";
import { HashLink } from "react-router-hash-link";
import { faFire } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Filter = () => {
  return (
    <nav className={styles["filter-nav"]} id="filter-nav">
      {/* Menu items */}
      <div className={styles["nav-links"]}>
        <li>
          <span>
            {" "}
            <FontAwesomeIcon icon={faFire} />{" "}
          </span>
          <HashLink smooth to="/#deals">
            Deals
          </HashLink>
        </li>
        <li>
          <HashLink smooth to="/#top">
            Home
          </HashLink>
        </li>
        <li>
          <HashLink smooth to="/#categories">
            Categories
          </HashLink>
        </li>
        <li>
          <HashLink smooth to="/#mall">
            Malls
          </HashLink>
        </li>
        <li>
          <HashLink smooth to="/#popular">
            Mega menu
          </HashLink>
        </li>
        <li>
          <HashLink smooth to="/#about">
            About
          </HashLink>
        </li>
        <li>
          <HashLink smooth to="/#contact">
            Contact
          </HashLink>
        </li>
      </div>
    </nav>
  );
};

export default Filter;
