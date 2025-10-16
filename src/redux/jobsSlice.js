import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import jobService from "../services/jobService";

const initialState = {
  jobs: [],
  companyJobs: [],
  currentJob: null,
  status: "idle",
};

export const fetchJobs = createAsyncThunk("jobs/fetchAll", async (_, { rejectWithValue }) => {
  try { return await jobService.getAll(); } catch (e) { return rejectWithValue(e.message); }
});

export const fetchCompanyJobs = createAsyncThunk("jobs/fetchCompany", async (_, { rejectWithValue }) => {
  try { return await jobService.getCompanyJobs(); } catch (e) { return rejectWithValue(e.message); }
});

export const fetchJobById = createAsyncThunk("jobs/fetchById", async (id, { rejectWithValue }) => {
  try { return await jobService.getById(id); } catch (e) { return rejectWithValue(e.message); }
});

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchJobs.pending, (s) => { s.status = "loading"; })
      .addCase(fetchJobs.fulfilled, (s, a) => { s.status = "succeeded"; s.jobs = a.payload; })
      .addCase(fetchJobs.rejected, (s) => { s.status = "failed"; })

      .addCase(fetchCompanyJobs.pending, (s) => { s.status = "loading"; })
      .addCase(fetchCompanyJobs.fulfilled, (s, a) => { s.status = "succeeded"; s.companyJobs = a.payload; })
      .addCase(fetchCompanyJobs.rejected, (s) => { s.status = "failed"; })

      .addCase(fetchJobById.pending, (s) => { s.status = "loading"; s.currentJob = null; })
      .addCase(fetchJobById.fulfilled, (s, a) => { s.status = "succeeded"; s.currentJob = a.payload; })
      .addCase(fetchJobById.rejected, (s) => { s.status = "failed"; });
  }
});

export default jobsSlice.reducer;
