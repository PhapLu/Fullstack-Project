import React, { useState } from "react";
import "./DistributionHub.css";
import { FaMapMarkerAlt } from "react-icons/fa";

const mockOrders = [
  { id: "A001", from: "address", to: "address", price: "$23.50", status: "active" },
  { id: "A002", from: "address", to: "address", price: "$11.90", status: "active" },
  { id: "A003", from: "address", to: "address", price: "$8.00",  status: "active" },
  { id: "A004", from: "address", to: "address", price: "$15.20", status: "active" },
  { id: "A005", from: "address", to: "address", price: "$6.70",  status: "active" },
  { id: "A006", from: "address", to: "address", price: "$12.30", status: "active" },
];

export default function DistributionHub() {
  const [orders, setOrders] = useState(mockOrders);

  const markDelivered = (id) => {
    setOrders((list) =>
      list.map((o) =>
        o.id === id ? { ...o, status: "delivered" } : o
      )
    );
  };

  const cancelOrder = (id) => {
    // TODO: xử lý sau (API, confirm, v.v.)
    // ví dụ: setOrders(list => list.map(o => o.id === id ? {...o, status:"cancelled"} : o));
    console.log("cancel", id);
  };

  return (
    <section className="hub container">
      <header className="hub__head">
        <h1>DISTRIBUTION HUB: <span className="loc">Location</span></h1>
        <p>See all active orders assigned to you and update the current status accordingly</p>
      </header>

      <div className="hub__grid">
        {orders.map((o) => (
          <article className="order-card" key={o.id}>
            {/* left block: route + price */}
            <div className="order-card__top">
              <div className="route">
                <FaMapMarkerAlt className="pin" />
                <div className="route__text">
                  <div className="from">From: <p>{o.from}</p></div>
                  <div>To: <span>{o.to}</span></div>
                </div>
              </div>

              <div className="price">
                <span>Price</span>
                <strong>{o.price}</strong>
              </div>

              <div className={`status-badge ${o.status}`}>
                {o.status === "active" ? "Active" :
                 o.status === "delivered" ? "Delivered" : "Cancelled"}
              </div>
            </div>

            <div className="order-card__bottom">
              <div className="order-no">No.{o.id}</div>

              <div className="actions">
                <button
                  className="actions_mark"
                  disabled={o.status !== "active"}
                  onClick={() => markDelivered(o.id)}
                >
                  Mark as delivered
                </button>

                <button
                  className="actions_cancle"
                  onClick={() => cancelOrder(o.id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
