import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data for services
const mockServices = [
  {
    id: 1,
    title: "Professional Child Care",
    provider: "Ahmed Mohamed",
    category: "childcare",
    rating: 4.8,
    reviews: 124,
    price: 25,
    description: "Experienced child care provider with 5 years of experience",
    image: "/service1.jpg"
  },
  {
    id: 2,
    title: "Elderly Companion Care",
    provider: "Fatima Hassan",
    category: "eldercare",
    rating: 4.9,
    reviews: 89,
    price: 30,
    description: "Specialized in Alzheimer's and dementia care",
    image: "/service2.jpg"
  },
  {
    id: 3,
    title: "Home Nursing Service",
    provider: "Dr. Mohamed Ali",
    category: "nursing",
    rating: 4.7,
    reviews: 156,
    price: 40,
    description: "Registered nurse with 10 years of experience",
    image: "/service3.jpg"
  },
  {
    id: 4,
    title: "Professional House Cleaning",
    provider: "Clean Team",
    category: "housekeeping",
    rating: 4.6,
    reviews: 203,
    price: 20,
    description: "Deep cleaning and regular maintenance",
    image: "/service4.jpg"
  },
  {
    id: 5,
    title: "Special Needs Child Care",
    provider: "Special Care Inc.",
    category: "childcare",
    rating: 4.9,
    reviews: 67,
    price: 35,
    description: "Specialized care for children with special needs",
    image: "/service5.jpg"
  }
];

// Async thunk for fetching services
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockServices;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    services: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default servicesSlice.reducer;


 