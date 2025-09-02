import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from "react";
import { apiUtils } from "../../utils/newRequest";

const KEY = "bm_cart_v1";
const CartCtx = createContext();

const initialState = (() => {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || { items: [] };
    } catch {
        return { items: [] };
    }
})();

function reducer(state, action) {
    switch (action.type) {
        case "ADD": {
            const { item } = action;
            const idx = state.items.findIndex((i) => i.id === item.id);
            let items = [...state.items];
            if (idx >= 0) {
                const nextQty = Math.min(
                    (items[idx].qty || 0) + (item.qty || 1),
                    items[idx].stock ?? Infinity
                );
                items[idx] = { ...items[idx], qty: nextQty };
            } else {
                items.push({
                    ...item,
                    qty: Math.min(item.qty || 1, item.stock ?? Infinity),
                });
            }
            return { ...state, items };
        }
        case "SET_QTY": {
            const { id, qty } = action;
            const items = state.items.map((it) =>
                it.id === id
                    ? {
                          ...it,
                          qty: Math.max(1, Math.min(qty, it.stock ?? Infinity)),
                      }
                    : it
            );
            return { ...state, items };
        }
        case "REMOVE":
            return {
                ...state,
                items: state.items.filter((i) => i.id !== action.id),
            };
        case "CLEAR":
            return { ...state, items: [] };
        case "REPLACE_FROM_SERVER": {
            const items = (action.items || []).map((it) => ({
                id: it.id,
                name: it.name,
                image: it.image,
                price: it.price,
                stock: it.stock,
                classification: it.classification,
                qty: it.qty,
            }));
            return { ...state, items };
        }
        default:
            return state;
    }
}

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    useEffect(() => localStorage.setItem(KEY, JSON.stringify(state)), [state]);

    const subtotal = useMemo(
        () =>
            state.items.reduce(
                (s, it) => s + (it.price || 0) * (it.qty || 0),
                0
            ),
        [state.items]
    );
    const itemCount = useMemo(
        () => state.items.reduce((s, it) => s + (it.qty || 0), 0),
        [state.items]
    );

    const addItem = async (item) => {
        const { id, qty = 1 } = item;
        const prev = state.items.find((x) => x.id === id);
        const prevQty = prev?.qty ?? 0;
        const wasNew = !prev;

        dispatch({ type: "ADD", item });

        try {
            await apiUtils.post(
                "/cart/addToCart",
                { productId: id, quantity: qty },
                { withCredentials: true }
            );

            // const res = await apiUtils.get("/cart");
            // dispatch({ type: "REPLACE_FROM_SERVER", items: res.data.items });
        } catch (e) {
            console.error("addToCart failed, rolling back", e);
            // 2) rollback
            if (wasNew) {
                dispatch({ type: "REMOVE", id });
            } else {
                dispatch({ type: "SET_QTY", id, qty: prevQty });
            }
        }
    };

    const value = {
        items: state.items,
        subtotal,
        itemCount,
        addItem,
        setQty: (id, qty) => dispatch({ type: "SET_QTY", id, qty }),
        removeItem: (id) => dispatch({ type: "REMOVE", id }),
        clear: () => dispatch({ type: "CLEAR" }),
    };

    return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => {
    const ctx = useContext(CartCtx);
    if (!ctx) throw new Error("useCart must be used within <CartProvider>");
    return ctx;
};
