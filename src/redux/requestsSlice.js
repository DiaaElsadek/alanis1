import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data for service requests
const mockRequests = [
  {
    id: 1,
    clientId: 101,
    clientName: "Sarah Johnson",
    providerId: 201,
    providerName: "Ahmed Mohamed",
    serviceType: "Babysitting",
    location: "Downtown Cairo",
    price: 50,
    date: "2024-01-15",
    status: "pending",
    createdAt: "2024-01-10",
    description: "Need babysitting for 2 children (ages 3 and 5) from 5 PM to 9 PM"
  },
  {
    id: 2,
    clientId: 102,
    clientName: "Mike Wilson",
    providerId: 202,
    providerName: "Fatima Ahmed",
    serviceType: "Home Nursing",
    location: "Giza",
    price: 80,
    date: "2024-01-16",
    status: "accepted",
    createdAt: "2024-01-08",
    description: "Daily nursing care for elderly patient"
  },
  {
    id: 3,
    clientId: 103,
    clientName: "Emily Brown",
    providerId: 201,
    providerName: "Ahmed Mohamed",
    serviceType: "Babysitting",
    location: "Heliopolis",
    price: 45,
    date: "2024-01-14",
    status: "completed",
    createdAt: "2024-01-05",
    description: "Weekend babysitting services"
  }
];

// Async thunks
export const fetchServiceRequests = createAsyncThunk(
  'requests/fetchServiceRequests',
  async (providerId = null) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (providerId) {
      return mockRequests.filter(request => request.providerId === providerId);
    }
    return mockRequests;
  }
);

export const updateRequestStatus = createAsyncThunk(
  'requests/updateRequestStatus',
  async ({ requestId, status }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { requestId, status };
  }
);

const requestsSlice = createSlice({
  name: 'requests',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    clearRequests: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch requests
      .addCase(fetchServiceRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchServiceRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update request status
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const { requestId, status } = action.payload;
        const request = state.items.find(req => req.id === requestId);
        if (request) {
          request.status = status;
        }
      });
  }
});

export const { clearRequests } = requestsSlice.actions;
export default requestsSlice.reducer;