import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import messageService from "../services/messageService";

const initialState = {
  messages: [],
  status: "idle",
};

export const fetchMessages = createAsyncThunk("messages/fetch", async (_, { rejectWithValue }) => {
  try { return await messageService.getAll(); } catch (e) { return rejectWithValue(e.message); }
});

const slice = createSlice({
  name: "messages",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMessages.pending, s => { s.status = "loading"; })
      .addCase(fetchMessages.fulfilled, (s, a) => { s.status = "succeeded"; s.messages = a.payload; })
      .addCase(fetchMessages.rejected, s => { s.status = "failed"; });
  }
});

export default slice.reducer;
