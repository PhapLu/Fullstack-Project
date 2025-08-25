import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const KEY = "bm_cart_v1";
const CartCtx = createContext();

const initialState = (() => {
  try { return JSON.parse(localStorage.getItem(KEY)) || { items: [] }; }
  catch { return { items: [] }; }
})();

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const { item } = action; // {id,name,image,price,stock,classification,qty}
      const idx = state.items.findIndex((i) => i.id === item.id);
      let items = [...state.items];
      if (idx >= 0) {
        const nextQty = Math.min(items[idx].qty + (item.qty || 1), items[idx].stock || Infinity);
        items[idx] = { ...items[idx], qty: nextQty };
      } else {
        items.push({ ...item, qty: Math.min(item.qty || 1, item.stock || Infinity) });
      }
      return { ...state, items };
    }
    case "SET_QTY": {
      const { id, qty } = action;
      const items = state.items.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, Math.min(qty, it.stock || Infinity)) } : it
      );
      return { ...state, items };
    }
    case "REMOVE": return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "CLEAR": return { ...state, items: [] };
    default: return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(state)), [state]);

  const subtotal = useMemo(
    () => state.items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0),
    [state.items]
  );
  const itemCount = useMemo(
    () => state.items.reduce((s, it) => s + (it.qty || 0), 0),
    [state.items]
  );

  const value = {
    items: state.items, subtotal, itemCount,
    addItem: (item) => dispatch({ type: "ADD", item }),
    setQty: (id, qty) => dispatch({ type: "SET_QTY", id, qty }),
    removeItem: (id) => dispatch({ type: "REMOVE", id }),
    clear: () => dispatch({ type: "CLEAR" }),
  };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => {
      const ctx = useContext(CartCtx);
      if (!ctx) {
        throw new Error("useCart must be used within <CartProvider>");
      }
      return ctx;
    };