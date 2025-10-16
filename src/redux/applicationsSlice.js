import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import applicationService from "../services/applicationService";

const initialState = {
  myApplications: [],
  status: "idle",
};

export const fetchMyApplications = createAsyncThunk("applications/fetchMy", async (_, { rejectWithValue }) => {
  try { return await applicationService.getMyApplications(); } catch (e) { return rejectWithValue(e.message); }
});

export const applyToJob = createAsyncThunk("applications/apply", async ({ jobId }, { rejectWithValue }) => {
  try { return await applicationService.apply(jobId); } catch (e) { return rejectWithValue(e.message); }
});

const slice = createSlice({
  name: "applications",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMyApplications.pending, s => { s.status = "loading"; })
      .addCase(fetchMyApplications.fulfilled, (s, a) => { s.status = "succeeded"; s.myApplications = a.payload; })
      .addCase(fetchMyApplications.rejected, s => { s.status = "failed"; })

      .addCase(applyToJob.pending, s => { s.status = "loading"; })
      .addCase(applyToJob.fulfilled, (s, a) => { s.status = "succeeded"; s.myApplications.push(a.payload); })
      .addCase(applyToJob.rejected, s => { s.status = "failed"; });
  }
});

export default slice.reducer;
