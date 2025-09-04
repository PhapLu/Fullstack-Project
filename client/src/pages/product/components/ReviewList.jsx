import { useQuery } from "react-query";
import { getJSON } from "../../../utils/api.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";

/** ==== MOCK CONFIG ==== */
const MOCK_ENABLED = true;

const mockReviews = [
  {
    _id: "mock_r1",
    customerId: { name: "Trần Thu Hà" },
    rating: 5,
    comment:
      "Đóng gói chắc chắn, giao nhanh. Màu sắc đúng như ảnh, rất ưng ý. Sẽ mua lại!",
    createdAt: "2025-09-01T08:30:00.000Z",
  },
  {
    _id: "mock_r2",
    customerId: { name: "Hoàng Nam" },
    rating: 4,
    comment:
      "Sản phẩm ổn trong tầm giá, chất liệu OK. Giao hơi trễ 1 ngày nên trừ 1 sao.",
    createdAt: "2025-08-28T15:10:00.000Z",
  },
];

function readReviews(productId) {
  if (!MOCK_ENABLED) return getJSON("/readReviews", { productId });
  // Trả về cấu trúc giống API thật
  return Promise.resolve({ reviews: mockReviews.map((r) => ({ ...r, productId })) });
}
/** ===================== */

export default function ReviewList({ productId }) {
  // Khi mock, luôn có pid mặc định để query chạy
  const pid = productId || "mock_product";

  const { data, isLoading, error } = useQuery(
    ["reviews", pid],
    () => readReviews(pid),
    {
      enabled: MOCK_ENABLED ? true : !!productId,
      staleTime: MOCK_ENABLED ? Infinity : 0,
    }
  );

  if (isLoading) return <div>Loading reviews…</div>;
  if (error)
    return (
      <div className="text-danger">
        Failed to load reviews: {String(error.message || error)}
      </div>
    );

  const reviews = data?.reviews || [];
  if (!reviews.length) return <div className="text-muted">No reviews yet.</div>;

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
              <strong className="fs-3">{r.customerId?.name || "User"}</strong>
              <span className="text-muted small">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
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
                  icon={n <= r.rating ? faStarSolid : faStarRegular}
                  className={n <= r.rating ? "text-warning" : "text-muted"}
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
