import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data for service providers
const mockProviders = [
  {
    id: 201,
    name: "Ahmed Mohamed",
    serviceType: "Babysitting",
    rating: 4.8,
    reviewCount: 127,
    experience: "5 years",
    location: "Cairo",
    hourlyRate: 50,
    isAvailable: true,
    skills: ["Child Care", "First Aid", "Homework Help"],
    bio: "Professional babysitter with 5 years of experience caring for children of all ages.",
    avatar: "/default-avatar.png",
    completedJobs: 150
  },
  {
    id: 202,
    name: "Fatima Ahmed",
    serviceType: "Home Nursing",
    rating: 4.9,
    reviewCount: 89,
    experience: "7 years",
    location: "Giza",
    hourlyRate: 80,
    isAvailable: true,
    skills: ["Elderly Care", "Medical Assistance", "Physical Therapy"],
    bio: "Registered nurse with extensive experience in home healthcare services.",
    avatar: "/default-avatar.png",
    completedJobs: 95
  },
  {
    id: 203,
    name: "Mohamed Ali",
    serviceType: "Senior Care",
    rating: 4.7,
    reviewCount: 64,
    experience: "4 years",
    location: "Alexandria",
    hourlyRate: 45,
    isAvailable: false,
    skills: ["Companion Care", "Medication Management", "Mobility Assistance"],
    bio: "Compassionate caregiver specializing in senior care and companionship.",
    avatar: "/default-avatar.png",
    completedJobs: 78
  },
  {
    id: 204,
    name: "Lina Hassan",
    serviceType: "Babysitting",
    rating: 4.6,
    reviewCount: 42,
    experience: "3 years",
    location: "Cairo",
    hourlyRate: 40,
    isAvailable: true,
    skills: ["Newborn Care", "Educational Activities", "Meal Preparation"],
    bio: "Energetic and caring babysitter who loves working with children.",
    avatar: "/default-avatar.png",
    completedJobs: 56
  },
    {
    id: 1,
    name: "Ahmed Mohamed",
    email: "ahmed@example.com",
    avatar: "/default-avatar.png",
    services: ["Child Care", "Housekeeping"],
    verificationStatus: "verified",
    rating: 4.5,
    joinDate: "2024-01-15"
  },
  {
    id: 2,
    name: "Fatima Hassan",
    email: "fatima@example.com",
    avatar: "/default-avatar.png",
    services: ["Elder Care", "Nursing"],
    verificationStatus: "pending",
    rating: 4.2,
    joinDate: "2024-02-01"
  },
  {
    id: 3,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "/default-avatar.png",
    services: ["Child Care", "Tutoring"],
    verificationStatus: "verified",
    rating: 4.8,
    joinDate: "2024-01-20"
  }

];

// Async thunk
export const fetchServiceProviders = createAsyncThunk(
  'providers/fetchServiceProviders',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProviders;
  }
);

const providersSlice = createSlice({
  name: 'providers',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    updateProviderAvailability: (state, action) => {
      const { providerId, isAvailable } = action.payload;
      const provider = state.items.find(prov => prov.id === providerId);
      if (provider) {
        provider.isAvailable = isAvailable;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchServiceProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { updateProviderAvailability } = providersSlice.actions;
export default providersSlice.reducer;