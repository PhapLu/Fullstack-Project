import { useQuery } from "react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { useEffect, useState } from "react";
import { apiUtils } from "../../../utils/newRequest";

export default function ReviewList({ productId }) {
    const pid = productId;

    const [reviews, serReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await apiUtils.get(`/review/readReviews/${pid}`);
                serReviews(response.data.metadata.reviews || []);
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            }
        }
        fetchReviews();
    }, []);

    return (
        <div className="vstack gap-5 pt-5 pb-5">
            {reviews.map((r) => (
                <div key={r._id} className="d-flex gap-3 align-items-start">
                    <div
                        className="rounded-circle bg-secondary p-4 flex-shrink-0"
                        style={{ width: 40, height: 40 }}
                        aria-hidden
                    />
                    <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2">
                            <strong className="fs-3">
                                {r.customerId?.name || "User"}
                            </strong>
                            <span className="text-muted small">
                                {r.createdAt
                                    ? new Date(r.createdAt).toLocaleDateString()
                                    : ""}
                            </span>
                        </div>

                        {/* Stars with FontAwesome */}
                        <div
                            className="my-1 d-flex align-items-center gap-1"
                            aria-label={`Rating: ${r.rating} out of 5`}
                        >
                            {[1, 2, 3, 4, 5].map((n) => (
                                <FontAwesomeIcon
                                    key={n}
                                    icon={
                                        n <= r.rating
                                            ? faStarSolid
                                            : faStarRegular
                                    }
                                    className={
                                        n <= r.rating
                                            ? "text-warning"
                                            : "text-muted"
                                    }
                                    size="sm"
                                />
                            ))}
                        </div>

                        <div className="fs-4">{r.comment}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
