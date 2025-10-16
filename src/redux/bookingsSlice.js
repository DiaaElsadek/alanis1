import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data for bookings
const mockBookings = [
  {
    id: 1,
    service: { title: "Child Care Service" },
    provider: { name: "Ahmed Mohamed" },
    client: { name: "Nadia Samir" },
    date: "2024-01-15",
    time: "10:00 AM",
    duration: "4 hours",
    status: "Completed",
    price: 50,
    serviceType: "childcare",
    caregiver: "Mona Ali"
  },
  {
    id: 2,
    service: { title: "Elder Care Service" },
    provider: { name: "Fatima Hassan" },
    client: { name: "Youssef Ibrahim" },
    date: "2024-01-20",
    time: "2:00 PM",
    duration: "6 hours",
    status: "Confirmed",
    price: 60,
    serviceType: "elderly",
    caregiver: "Hassan Mahmoud"
  },
  {
    id: 3,
    service: { title: "Nursing Service" },
    provider: { name: "Mohamed Ali" },
    client: { name: "Laila Mohammed" },
    date: "2024-01-25",
    time: "9:00 AM",
    duration: "8 hours",
    status: "Pending",
    price: 70,
    serviceType: "nursing",
    caregiver: "Nadia Samir"
  },
  {
    id: 4,
    service: { title: "House Cleaning" },
    provider: { name: "Samira Ahmed" },
    client: { name: "Omar Khaled" },
    date: "2024-01-18",
    time: "11:00 AM",
    duration: "3 hours",
    status: "Cancelled",
    price: 40,
    serviceType: "housekeeping",
    caregiver: "Karim Said"
  }
];

// Async thunk for fetching bookings
export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockBookings;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch bookings');
    }
  }
);

// Async thunk for fetching all bookings (for caregiver dashboard)
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockBookings;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch bookings');
    }
  }
);

// Async thunk for updating booking status
export const updateBookingStatus = createAsyncThunk(
  'bookings/updateStatus',
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Simulate API response
      return { bookingId, status };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update booking status');
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    myBookings: [],
    allBookings: [], // For caregiver dashboard
    loading: false,
    error: null,
    filters: {
      status: 'all',
      serviceType: 'all',
      dateRange: null
    }
  },
  reducers: {
    setBookingFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearBookingError: (state) => {
      state.error = null;
    },
    // Sync action for immediate status update (optimistic update)
    updateBookingStatusLocal: (state, action) => {
      const { bookingId, status } = action.payload;
      const booking = state.allBookings.find(b => b.id === bookingId) || 
                     state.myBookings.find(b => b.id === bookingId);
      if (booking) {
        booking.status = status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch my bookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.myBookings = mockBookings; // Fallback to mock data
      })
      // Fetch all bookings (for dashboard)
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.allBookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.allBookings = mockBookings; // Fallback to mock data
      })
      // Update booking status
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const { bookingId, status } = action.payload;
        const booking = state.allBookings.find(b => b.id === bookingId) || 
                       state.myBookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = status;
        }
      });
  }
});

export const { setBookingFilters, clearBookingError, updateBookingStatusLocal } = bookingsSlice.actions;

// Selectors
export const selectAllBookings = (state) => state.bookings.allBookings;
export const selectMyBookings = (state) => state.bookings.myBookings;
export const selectBookingsLoading = (state) => state.bookings.loading;
export const selectBookingsError = (state) => state.bookings.error;
export const selectBookingFilters = (state) => state.bookings.filters;

// Filtered bookings selector
export const selectFilteredBookings = (state) => {
  const bookings = state.bookings.allBookings;
  const filters = state.bookings.filters;
  
  return bookings.filter(booking => {
    const statusMatch = filters.status === 'all' || booking.status === filters.status;
    const serviceMatch = filters.serviceType === 'all' || booking.serviceType === filters.serviceType;
    const dateMatch = !filters.dateRange || (
      booking.date >= filters.dateRange.start && 
      booking.date <= filters.dateRange.end
    );
    
    return statusMatch && serviceMatch && dateMatch;
  });
};

// Statistics selectors
export const selectBookingStats = (state) => {
  const bookings = state.bookings.allBookings;
  
  return {
    total: bookings.length,
    completed: bookings.filter(b => b.status === 'Completed').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length,
    totalRevenue: bookings
      .filter(b => b.status === 'Completed')
      .reduce((sum, booking) => sum + booking.price, 0)
  };
};

export default bookingsSlice.reducer;