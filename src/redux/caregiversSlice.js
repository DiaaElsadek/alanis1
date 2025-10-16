import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data for caregivers
const mockCaregivers = [
  {
    id: 1,
    name: "Mona Ali",
    serviceType: "childcare",
    experience: "5",
    location: "Cairo",
    hourlyRate: "50",
    skills: "First Aid, Child Development",
    bio: "Experienced childcare provider with 5 years of experience.",
    verified: true
  },
  {
    id: 2,
    name: "Hassan Mahmoud",
    serviceType: "elderly",
    experience: "8",
    location: "Alexandria",
    hourlyRate: "60",
    skills: "Elderly Care, Medication Management",
    bio: "Compassionate elderly care specialist.",
    verified: true
  },
  {
    id: 3,
    name: "Nadia Samir",
    serviceType: "nursing",
    experience: "10",
    location: "Giza",
    hourlyRate: "70",
    skills: "Nursing, First Aid, Patient Care",
    bio: "Registered nurse with extensive experience.",
    verified: false
  }
];

// Async thunk for fetching caregivers
export const fetchCaregivers = createAsyncThunk(
  'caregivers/fetchCaregivers',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockCaregivers;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const caregiversSlice = createSlice({
  name: 'caregivers',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    addCaregiver: (state, action) => {
      state.items.push({
        id: Math.max(...state.items.map(c => c.id), 0) + 1,
        ...action.payload,
        verified: false
      });
    },
    updateCaregiver: (state, action) => {
      const index = state.items.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    deleteCaregiver: (state, action) => {
      state.items = state.items.filter(c => c.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCaregivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCaregivers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCaregivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = mockCaregivers; // Fallback to mock data
      });
  }
});

export const { addCaregiver, updateCaregiver, deleteCaregiver } = caregiversSlice.actions;
export default caregiversSlice.reducer;