import React from "react";
import "./PopularProducts.css";
import { Link } from "react-router-dom";

const products = [
  { id: 1,  img: "/images/popular/p1.jpg",  title: "Hair Dryer Blue",               desc: "Lorem ipsum is simply dummy text of the printing", price: '999'},
  { id: 2,  img: "/images/popular/p2.jpg",  title: "RGB Gaming Keyboard",           desc: "Lorem ipsum is simply dummy text of the printing" , price: '999'},
  { id: 3,  img: "/images/popular/p3.jpg",  title: "Winter Vest Set",               desc: "Lorem ipsum is simply dummy text of the printing", price: '999' },
  { id: 4,  img: "/images/popular/p4.jpg",  title: "Travel Bag & Accessories",      desc: "Lorem ipsum is simply dummy text of the printing", price: '999' },
  { id: 5,  img: "/images/popular/p5.jpg",  title: "Wireless Earbuds 50H",          desc: "Lorem ipsum is simply dummy text of the printing" , price: '999' },
  { id: 6,  img: "/images/popular/p6.jpg",  title: "Super Sale Bundle",             desc: "Lorem ipsum is simply dummy text of the printing" , price: '999' },
  { id: 7,  img: "/images/popular/p7.jpg",  title: "Reboxy Sandals",                desc: "Lorem ipsum is simply dummy text of the printing" , price: '999' },
  { id: 8,  img: "/images/popular/p8.jpg",  title: "2-mode Wireless Mouse",      desc: "Lorem ipsum is simply dummy text of the printing" , price: '999' },
  { id: 9,  img: "/images/popular/p9.jpg",  title: "Glow Your Skin Serum",          desc: "Lorem ipsum is simply dummy text of the printing" , price: '999' },
  { id: 10, img: "/images/popular/p10.jpg", title: "PediaSure for Kids",            desc: "Lorem ipsum is simply dummy text of the printing" , price: '999' },
  { id: 11, img: "/images/popular/p11.jpg", title: "New Arrival Special Bag",       desc: "Lorem ipsum is simply dummy text of the printing" , price: '999' },
  { id: 12, img: "/images/popular/p12.jpg", title: "Seminar Starter Kit",           desc: "Lorem ipsum is simply dummy text of the printing" , price: '999' },
  { id: 13, img: "/images/popular/p13.jpg", title: "Kids Outfit – 50% Off",         desc: "Lorem ipsum is simply dummy text of the printing" , price: '999' },
  { id: 14, img: "/images/popular/p14.jpg", title: "Home Decor Surf Boards",        desc: "Lorem ipsum is simply dummy text of the printing" , price: '999' },
  { id: 15, img: "/images/popular/p15.jpg", title: "TVS Bluetooth Speaker",         desc: "Lorem ipsum is simply dummy text of the printing" , price: '999' },
  { id: 16, img: "/images/popular/p16.jpg", title: "Orange Skyline Blocks",         desc: "Lorem ipsum is simply dummy text of the printing" , price: '999' },
  { id: 17, img: "/images/popular/p17.jpg", title: "Out Now – Poster Frame",        desc: "Lorem ipsum is simply dummy text of the printing" , price: '999' },
  { id: 18, img: "/images/popular/p18.jpg", title: "Daily Wear Casual Set",         desc: "Lorem ipsum is simply dummy text of the printing" , price: '999' },
];

export default function PopularProducts() {
  return (
    <section className="popular container" id="popular">
      <h2>Popular Products</h2>

      <div className="popular-grid">
        {/* Link to product:id */}
            {products.map(p => (
                <Link to={`/product/${p.id}`} key={p.id} className="pop-card">
                    <article>
                        <div className="thumb">
                            <img src={p.img} alt={p.title} loading="lazy" />
                        </div>
                        <div className="info">
                            <h3 title={p.title}>{p.title}</h3>
                            <p className="desc" title={p.desc}>{p.desc}</p>
                            <span className="price-link">{p.price}</span>
                        </div>
                    </article>
                </Link>
            ))}
      </div>
    </section>
  );
}
