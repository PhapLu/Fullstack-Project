import { useQuery } from "react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { useEffect, useState } from "react";
import { apiUtils } from "../../../utils/newRequest";
import { getImageUrl } from "../../../utils/imageUrl";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "../../../store/slices/authSlices";

export default function ReviewList({ productId }) {
  const user = useSelector(selectUser);
  const pid = productId;

  const [reviews, serReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await apiUtils.get(`/review/readReviews/${pid}`);
        console.log(response)
        serReviews(response.data.metadata.reviews || []);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="vstack gap-5 pt-5 pb-5">
      {reviews.map((review) => (
        <div key={review._id} className="d-flex gap-3 align-items-start mb-3">
          {/* Avatar */}
          <img
            src={
              getImageUrl(review.customerId.avatar) ||
              "/uploads/pastal_system_default_avatar.png"
            }
            alt="avatar"
            className="rounded-circle"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
          />

          {/* Right*/}
          <div className="flex-grow-1">
            <div
              className="d-flex align-items-center"
              style={{ minHeight: "40px" }}
            >
              <span className="fw-bold fs-3">{review.customerId.customerProfile.name || review.customerId.username}</span>
            </div>

            {/* Rating + Comment */}
            <div className=" ps-1">
              {/* Stars */}
              <div
                className="mb-1 d-flex align-items-center gap-1"
                aria-label={`Rating: ${review.rating} out of 5`}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <FontAwesomeIcon
                    key={n}
                    icon={n <= review.rating ? faStarSolid : faStarRegular}
                    className={n <= review.rating ? "text-warning" : "text-muted"}
                    size="sm"
                  />
                ))}
              </div>

              {/* Comment */}
              <div className="text-body mt-2">{review.comment}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
