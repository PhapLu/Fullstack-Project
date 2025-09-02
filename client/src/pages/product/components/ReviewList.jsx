import { useQuery } from "react-query";
import { getJSON } from "../../../utils/api.js";

export default function ReviewList({ productId }) {
    const { data, isLoading, error } = useQuery(
        ["reviews", productId],
        () => getJSON("/readReviews", { productId }),
        { enabled: !!productId }
    );

    if (isLoading) return <div>Loading reviews…</div>;
    if (error)
        return (
            <div className="text-danger">
                Failed to load reviews: {String(error.message || error)}
            </div>
        );

    const reviews = data?.reviews || [];
    if (!reviews.length)
        return <div className="text-muted">No reviews yet.</div>;

    return (
        <div className="vstack gap-4">
            {reviews.map((r) => (
                <div key={r._id} className="d-flex gap-3 align-items-start">
                    <div
                        className="rounded-circle bg-secondary"
                        style={{ width: 40, height: 40 }}
                        aria-hidden
                    />
                    <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2">
                            <strong>{r.customerId?.name || "User"}</strong>
                            <span className="text-muted small">
                                {r.createdAt
                                    ? new Date(r.createdAt).toLocaleDateString()
                                    : ""}
                            </span>
                        </div>
                        <div className="my-1">
                            {"★".repeat(r.rating)}
                            {"☆".repeat(5 - r.rating)}
                        </div>
                        <div>{r.comment}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
