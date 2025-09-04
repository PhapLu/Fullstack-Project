import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "react-query";
import { apiUtils } from "../../../utils/newRequest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";

const isValidObjectId = (v) => /^[a-f\d]{24}$/i.test(String(v || ""));

export default function ReviewForm({ productId, orderId = "", customerId }) {
  console.log("[ReviewForm] render", { productId, orderId, customerId });
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const canSubmit = useMemo(() => {
    return (
      !!productId &&
      isValidObjectId(orderId) &&
      comment.trim().length >= 5 &&
      rating >= 1 &&
      rating <= 5
    );
  }, [productId, orderId, comment, rating]);

  const { mutate, isLoading, error } = useMutation(
    async (payload) => {
      console.log(payload)
      const res = await apiUtils.post("/review/createReview", payload);
        return res.data;
     },
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
      console.log("[ReviewForm] onSubmit", {
             productId,
             orderId,
             rating,
             commentLen: comment.trim().length,
           });
      if (!canSubmit) return;

      const payload = {
        productId,
        orderId,
        rating,
        comment: comment.trim(),
      };

      if (customerId) payload.customerId = customerId;

      console.log("[ReviewForm] mutate payload", payload);
      mutate(payload);
      console.debug("POST URL =", (apiUtils.defaults?.baseURL || "") + "/review/createReview");

    };


  return (
    <form className="card p-4 mb-4" onSubmit={onSubmit}>
      <div className="mb-2 fs-2 fw-semibold">Write a review</div>

      <div className="mb-2 d-flex align-items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            className={`bg-transparent border-0 p-1 ${
              n <= rating ? "text-warning" : "text-muted"
            }`}
            onClick={() => setRating(n)}
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
            aria-pressed={n <= rating}
            style={{ lineHeight: 1, cursor: "pointer" }}
          >
            <FontAwesomeIcon
              icon={n <= rating ? faStarSolid : faStarRegular}
              size="lg"
            />
          </button>
        ))}
      </div>

      <textarea
        className="form-control form-control-lg mb-2"
        placeholder="Your comment (min 5 chars)"
        minLength={5}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        rows={8}
      />

      {error && (
        <div className="text-danger small mb-2">
          {String(error.message || error)}
        </div>
      )}

      <button className="btn btn-primary btn-lg" disabled={isLoading || !canSubmit}>
        {isLoading ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
