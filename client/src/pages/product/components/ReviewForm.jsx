import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { postJSON } from "../../../utils/api.js";

export default function ReviewForm({ productId, orderId = "" }) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [localOrderId, setLocalOrderId] = useState(orderId); 

  const { mutate, isLoading, error } = useMutation(
    (payload) => postJSON("/createReview", payload),
    {
      onSuccess: () => {
        setComment("");
        setRating(5);
        qc.invalidateQueries(["reviews", productId]);
        alert("Review submitted!");
      },
    }
  );

  const onSubmit = (e) => {
    e.preventDefault();
    mutate({
      productId,
      orderId: localOrderId || orderId, 
      rating,
      comment,
    });
  };

  return (
    <form className="card p-3 mb-4" onSubmit={onSubmit}>
      <div className="mb-2 fw-semibold">Write a review</div>

      <div className="mb-2 d-flex align-items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            className={"btn btn-sm " + (n <= rating ? "btn-warning" : "btn-outline-secondary")}
            onClick={() => setRating(n)}
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>

      {!orderId && (
        <input
          className="form-control mb-2"
          placeholder="Order ID (required by API)"
          value={localOrderId}
          onChange={(e) => setLocalOrderId(e.target.value)}
          required
        />
      )}

      <textarea
        className="form-control mb-2"
        placeholder="Your comment (min 5 chars)"
        minLength={5}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />

      {error && <div className="text-danger small mb-2">{String(error.message)}</div>}

      <button className="btn btn-primary" disabled={isLoading}>
        {isLoading ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
