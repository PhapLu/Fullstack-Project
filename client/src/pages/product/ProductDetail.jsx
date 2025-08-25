import { useState } from "react";
import "./ProductDetail.css";

export default function ProductDetail() {

  // Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submitNew = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setReviews((prev) => [
      {
        _id: "mock-" + (prev.length + 1),
        name: "You",
        createdAt: new Date().toISOString(),
        rating,
        comment: comment.trim(),
      },
      ...prev,
    ]);
    setComment("");
    setRating(5);
  };

  const Stars = ({ value, onChange, readOnly = false }) => (
    <div className="d-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={"btn btn-sm " + (n <= value ? "btn-warning" : "btn-outline-secondary")}
          style={{ lineHeight: 1, borderRadius: 999 }}
          onClick={readOnly ? undefined : () => onChange?.(n)}
          disabled={readOnly}
          aria-label={readOnly ? undefined : `Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div className="container py-4 reviews-page">
      <h2 className="mb-4 text-uppercase fw-bold">Product Feedback</h2>

      <form className="card border-0 shadow-sm p-3 mb-4 rounded-4" onSubmit={submitNew}>
        <div className="d-flex gap-3">
          <div className="rounded-circle bg-secondary flex-shrink-0" style={{ width: 48, height: 48 }} aria-hidden />
          <div className="flex-grow-1">
            <div className="mb-2">
              <Stars value={rating} onChange={setRating} />
            </div>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <div className="text-end mt-3">
              <button className="btn btn-primary px-4">Submit review</button>
            </div>
          </div>
        </div>
      </form>

      <div className="vstack gap-4">
        {reviews.map((r) => (
          <div key={r._id} className="pb-4 border-bottom">
            <div className="d-flex gap-3 align-items-start">
              <div className="rounded-circle bg-secondary flex-shrink-0" style={{ width: 48, height: 48 }} aria-hidden />
              <div className="flex-grow-1">
                <div className="text-muted small" style={{ marginTop: 2 }}>
                  <div style={{ fontWeight: 600, color: "#343a40" }}>{r.name}</div>
                  <div>{new Date(r.createdAt).toLocaleDateString("vi-VN")}</div>
                </div>
                <div className="mt-2" style={{ color: "#4a4a4a" }}>{r.comment}</div>
                <div className="mt-3"><Stars value={r.rating} readOnly /></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
