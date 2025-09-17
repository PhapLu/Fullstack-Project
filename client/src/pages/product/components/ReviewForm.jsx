// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Le Khanh Huyen
// ID: S4026707

import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";  
import { apiUtils } from "../../../utils/newRequest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/authSlices";

const isValidObjectId = (v) => /^[a-f\d]{24}$/i.test(String(v || ""));

export default function ReviewForm({ productId, orderId = "" }) {
  const qc = useQueryClient();
  const navigate = useNavigate();                           
  const user = useSelector(selectUser);

  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("");

  const { mutate, isLoading, error } = useMutation(
    async (payload) => {
      const res = await apiUtils.post("/review/createReview", payload);
      return res.data;
    },
    {
      onSuccess: () => {
        setComment("");
        setRating(4);
        qc.invalidateQueries(["reviews", productId]);

        // Navigate
        const target =
          user && user._id
            ? `/user/${user._id}/order-history`
            : `/order-history`;
        navigate(target);
      },
    }
  );

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = {
      productId,
      orderId,
      rating,
      comment: comment.trim(),
    };
    mutate(payload);
  };

  return (
    <form id="review" className="card p-4 mb-4" onSubmit={onSubmit}>
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

        <span className="ms-1 fs-4">({rating}/5)</span>

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

      <button className="btn btn-primary btn-lg" disabled={isLoading}>{isLoading ? "Submitting..." : "Submit review"}</button>
    </form>
  );
}
