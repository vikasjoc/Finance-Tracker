import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/axios';

export const getBudgets = createAsyncThunk(
  'budgets/getAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/budgets', { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch budgets');
    }
  }
);

export const getBudgetSummary = createAsyncThunk(
  'budgets/getSummary',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/budgets/summary');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch budget summary');
    }
  }
);

export const createBudget = createAsyncThunk(
  'budgets/create',
  async (budgetData, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/budgets', budgetData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create budget');
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/update',
  async ({ id, ...budgetData }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/budgets/${id}`, budgetData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update budget');
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/delete',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/budgets/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete budget');
    }
  }
);

const initialState = {
  budgets: [],
  summary: null,
  loading: false,
  error: null,
};

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearBudgetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBudgets.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload.data;
      })
      .addCase(getBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getBudgetSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBudgetSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.data;
      })
      .addCase(getBudgetSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.budgets.push(action.payload.data);
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.budgets.findIndex((b) => b._id === action.payload.data._id);
        if (index !== -1) {
          state.budgets[index] = action.payload.data;
        }
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter((b) => b._id !== action.payload);
      });
  },
});

export const { clearBudgetError } = budgetSlice.actions;
export default budgetSlice.reducer;

