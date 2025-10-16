import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import notificationService from "../services/notificationService";

const initialState = {
  items: [],
  status: "idle",
};

export const fetchNotifications = createAsyncThunk("notifications/fetch", async (_, { rejectWithValue }) => {
  try { return await notificationService.getAll(); } catch (e) { return rejectWithValue(e.message); }
});

export const markAllRead = createAsyncThunk("notifications/markAll", async (_, { rejectWithValue }) => {
  try { return await notificationService.markAllRead(); } catch (e) { return rejectWithValue(e.message); }
});

export const markAsRead = createAsyncThunk("notifications/markAsRead", async (notificationId, { rejectWithValue }) => {
  try { 
    await notificationService.markAsRead(notificationId);
    return notificationId;
  } catch (e) { return rejectWithValue(e.message); }
});

const slice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.pending, s => { s.status = "loading"; })
      .addCase(fetchNotifications.fulfilled, (s, a) => { s.status = "succeeded"; s.items = a.payload; })
      .addCase(fetchNotifications.rejected, s => { s.status = "failed"; })

      .addCase(markAllRead.fulfilled, (s) => {
        s.items = s.items.map(i => ({ ...i, read: true }));
      })
      
      .addCase(markAsRead.fulfilled, (s, a) => {
        const notificationId = a.payload;
        const notification = s.items.find(item => item.id === notificationId);
        if (notification) {
          notification.read = true;
        }
      });
  }
});

export default slice.reducer;