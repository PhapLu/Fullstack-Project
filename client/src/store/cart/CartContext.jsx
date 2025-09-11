// src/store/cart/CartContext.jsx
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
} from "react";
import { apiUtils } from "../../utils/newRequest";
import { useSelector } from "react-redux";
import { selectUser } from "../slices/authSlices";

const KEY = "bm_cart_v1";
const makeKey = (userId) => `${KEY}:${userId ?? "guest"}`;
const CartCtx = createContext();

function reducer(state, action) {
    switch (action.type) {
        case "RESET": {
            const next = action.state ?? { items: [] };
            return { items: Array.isArray(next.items) ? next.items : [] };
        }
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
        case "REPLACE_FROM_SERVER":
            return { ...state, items: action.items || [] };
        default:
            return state;
    }
}

// Map BE -> FE
const mapServerItems = (items = []) =>
    items
        .filter((x) => x?.productId && x.quantity != null)
        .map((x) => {
            const p = x.productId;
            return {
                id: p._id,
                name: p.title || p.name,
                image:
                    p.thumbnail ||
                    p.image ||
                    (Array.isArray(p.images) ? p.images[0] : undefined),
                price: p.price,
                stock: typeof p.stock === "number" ? p.stock : Infinity,
                classification: p.classification?.name || p.classification,
                qty: x.quantity,
            };
        });

// Map FE -> BE
const toServerItems = (items = []) =>
    items
        .filter((x) => x && x.id && Number.isFinite(Number(x.qty)))
        .map((x) => ({ productId: x.id, quantity: Number(x.qty) }));

// Safe localStorage helpers
const readLocal = (key) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : { items: [] };
    } catch {
        return { items: [] };
    }
};
const writeLocal = (key, payload) => {
    try {
        localStorage.setItem(key, JSON.stringify(payload));
    } catch {}
};

export function CartProvider({ children }) {
    const user = useSelector(selectUser);
    const userId = user?._id || user?.id || null;
    const storageKey = useMemo(() => makeKey(userId), [userId]);

    const [state, dispatch] = useReducer(reducer, { items: [] });

    // keep latest state for effects
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const prevUserIdRef = useRef(userId);
    const hydratedKeysRef = useRef(new Set());

    // --- Auth transitions & hydration ---
    useEffect(() => {
        let canceled = false;

        (async () => {
            const prevUserId = prevUserIdRef.current;
            const isLogin = !prevUserId && !!userId;
            const isLogout = !!prevUserId && !userId;
            const bootLoggedIn =
                !!userId &&
                !isLogin &&
                !hydratedKeysRef.current.has(storageKey);

            // 1) Hydrate from local for *this* key
            if (!hydratedKeysRef.current.has(storageKey)) {
                const parsed =
                    readLocal(storageKey) || readLocal(makeKey(null));
                if (!canceled) {
                    parsed.items = (parsed.items || []).filter(
                        (x) => x && x.id
                    );
                    dispatch({ type: "RESET", state: parsed });
                    hydratedKeysRef.current.add(storageKey);
                }
            }

            // 2) On logout → snapshot + switch to guest
            if (isLogout) {
                try {
                    const payload = {
                        items: toServerItems(stateRef.current.items),
                    };
                    await apiUtils.put("/cart/snapshot", payload);
                } catch (e) {
                    console.warn("snapshot on logout failed", e);
                } finally {
                    writeLocal(makeKey(null), {
                        items: stateRef.current.items,
                    });
                    hydratedKeysRef.current.delete(makeKey(null)); // allow guest hydration
                }
            }

            // 3) On login → replace with DB
            // 3) On login or boot: always merge local + server
            if (isLogin || bootLoggedIn) {
                try {
                    const res = await apiUtils.get("/cart/readCart");
                    const serverItems = mapServerItems(
                        res?.data?.metadata?.cart?.items ?? []
                    );

                    // IMPORTANT: read directly from localStorage, not stateRef
                    const localItems = readLocal(storageKey)?.items || [];

                    // merge by productId, keep latest quantity (local wins if changed)
                    const map = new Map();
                    [...serverItems, ...localItems].forEach((it) => {
                        const prev = map.get(it.id);
                        if (!prev) map.set(it.id, it);
                        else {
                            // if qty differs, prefer the larger one (or local)
                            map.set(it.id, {
                                ...it,
                                qty: Math.max(prev.qty, it.qty),
                            });
                        }
                    });

                    const mergedItems = [...map.values()];

                    dispatch({
                        type: "REPLACE_FROM_SERVER",
                        items: mergedItems,
                    });
                    writeLocal(storageKey, { items: mergedItems });

                    // also push merged result to DB
                    await apiUtils.put("/cart/snapshot", {
                        items: toServerItems(mergedItems),
                    });
                } catch (e) {
                    console.warn("readCart on login/boot failed", e);
                }
            }

            prevUserIdRef.current = userId;
        })();

        return () => {
            canceled = true;
        };
    }, [storageKey, userId]);

    // Persist to current localStorage key on every change
    useEffect(() => {
        if (!hydratedKeysRef.current.has(storageKey)) return;
        writeLocal(storageKey, state);

        if (userId) {
            apiUtils
                .put("/cart/snapshot", { items: toServerItems(state.items) })
                .catch((e) => console.warn("auto snapshot failed", e));
        }
    }, [state, storageKey, userId]);

    // --- Public API: ONLY local updates during session ---
    const addItem = (item) => {
        dispatch({ type: "ADD", item });
    };

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

    const value = {
        items: state.items,
        subtotal,
        itemCount,
        addItem, // local only
        // in CartProvider's value:
        setQty: (id, qty) => {
            dispatch({ type: "SET_QTY", id, qty });
            if (userId) {
                // debounce/throttle if you want
                apiUtils
                    .put("/cart/snapshot", {
                        items: toServerItems(
                            stateRef.current.items.map((it) =>
                                it.id === id ? { ...it, qty } : it
                            )
                        ),
                    })
                    .catch((e) => console.warn("snapshot failed", e));
            }
        },

        removeItem: (id) => dispatch({ type: "REMOVE", id }), // local only
        clear: () => dispatch({ type: "CLEAR" }), // local only

        applyPurchase: async (purchasedItems = []) => {
            // Build a quick lookup: productId -> total purchased qty
            const decMap = new Map();
            for (const it of purchasedItems) {
                const pid = String(it?.productId);
                const q = Number(it?.quantity) || 0;
                if (!pid || q <= 0) continue;
                decMap.set(pid, (decMap.get(pid) || 0) + q);
            }

            // Compute next cart items
            const current = stateRef.current.items || [];
            const nextItems = current
                .map((it) => {
                    const dec = decMap.get(String(it.id)) || 0;
                    const nextQty = Math.max(0, (it.qty || 0) - dec);
                    return nextQty > 0 ? { ...it, qty: nextQty } : null;
                })
                .filter(Boolean);

            // Locally update & persist to localStorage
            dispatch({ type: "RESET", state: { items: nextItems } });
            writeLocal(storageKey, { items: nextItems });

            // Also persist to DB if logged in
            if (userId) {
                try {
                    await apiUtils.put("/cart/snapshot", {
                        items: toServerItems(nextItems),
                    });
                } catch (e) {
                    console.warn("applyPurchase snapshot failed", e);
                }
            }
        },

        // optional: expose a manual saver if you ever want to force-save
        saveNow: async () => {
            if (!userId) return;
            try {
                await apiUtils.put("/cart/snapshot", {
                    items: toServerItems(stateRef.current.items),
                });
            } catch (e) {
                console.warn("manual snapshot failed", e);
            }
        },
    };

    return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => {
    const ctx = useContext(CartCtx);
    if (!ctx) throw new Error("useCart must be used within <CartProvider>");
    return ctx;
};
