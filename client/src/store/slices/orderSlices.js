// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// POST /api/orders
export const createOrders = createAsyncThunk(
  "orders/create",
  async ({ items, shippingAddress }) => {
    const { data } = await api.post("/orders", { items, shippingAddress });
    return data.orders; // array: 1 vendor = 1 order
  }
);

// GET /api/orders/my
export const fetchMyOrders = createAsyncThunk("orders/my", async (status) => {
  const { data } = await api.get("/orders/my", { params: { status } });
  return data.orders;
});

// GET /api/orders/:id
export const fetchOrderById = createAsyncThunk("orders/getById", async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data.order;
});

// GET /api/orders/shipper
export const fetchShipperOrders = createAsyncThunk(
  "orders/shipper",
  async (status = "placed") => {
    const { data } = await api.get("/orders/shipper", { params: { status } });
    return data.orders;
  }
);

// PATCH /api/orders/:id/status
export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, status }) => {
    const { data } = await api.patch(`/orders/${id}/status`, { status });
    return data.order;
  }
);

const slice = createSlice({
  name: "orders",
  initialState: {
    creating: false,
    my: [],
    current: null,
    shipper: [],
    error: null,
    lastCreated: [],
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(createOrders.pending, (s) => {
      s.creating = true;
      s.error = null;
    })
      .addCase(createOrders.fulfilled, (s, a) => {
        s.creating = false;
        s.lastCreated = a.payload;
      })
      .addCase(createOrders.rejected, (s, a) => {
        s.creating = false;
        s.error = a.error.message;
      })

      .addCase(fetchMyOrders.fulfilled, (s, a) => {
        s.my = a.payload;
      })
      .addCase(fetchOrderById.fulfilled, (s, a) => {
        s.current = a.payload;
      })

      .addCase(fetchShipperOrders.fulfilled, (s, a) => {
        s.shipper = a.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (s, a) => {
        s.shipper = s.shipper.map((o) =>
          o._id === a.payload._id ? a.payload : o
        );
        if (s.current && s.current._id === a.payload._id) s.current = a.payload;
      });
  },
});

export default slice.reducer;
