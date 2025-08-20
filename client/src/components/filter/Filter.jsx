import React from "react";
import "./Filter.css";
import { NavLink } from "react-router-dom";
import { faFire } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Filter = () => {
  return (
    <nav className="filter-nav">
      {/* Dropdown All categories */}
      <div className="dropdown">
        <button className="dropdown-btn">
          All categories <span className="arrow">▼</span>
        </button>
        <ul className="dropdown-menu">
          <li>Electronics</li>
          <li>Fashion</li>
          <li>Home & Garden</li>
          <li>Sports</li>
          <li>Books</li>
        </ul>
      </div>

      {/* Menu items */}
      <ul className="nav-links">
        <li>
          <span> <FontAwesomeIcon icon={faFire} /> </span>
          <NavLink to="/deals">Deals</NavLink>
        </li>
        <li>
          <NavLink to="/" end>Home</NavLink>
        </li>
        <li>
          <NavLink to="/categories">Categories</NavLink>
        </li>
        <li>
          <NavLink to="/mall">Malls</NavLink>
        </li>
        <li>
          <NavLink to="/mega-menu">Mega menu</NavLink>
        </li>
        <li>
          <NavLink to="/about">About</NavLink>
        </li>
        <li>
          <NavLink to="/contact">Contact</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Filter;
