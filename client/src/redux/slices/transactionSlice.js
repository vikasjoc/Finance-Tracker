import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/axios';

export const getTransactions = createAsyncThunk(
  'transactions/getAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/transactions', { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch transactions');
    }
  }
);

export const getTransactionStats = createAsyncThunk(
  'transactions/getStats',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/transactions/stats', { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch stats');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (transactionData, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/transactions', transactionData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create transaction');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, ...transactionData }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/transactions/${id}`, transactionData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/transactions/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete transaction');
    }
  }
);

export const exportCSV = createAsyncThunk(
  'transactions/exportCSV',
  async (params, { rejectWithValue }) => {
    try {
      const response = await API.get('/transactions/export/csv', {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Export failed');
    }
  }
);

const initialState = {
  transactions: [],
  stats: null,
  total: 0,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  statsLoading: false,
  error: null,
  filters: {
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    search: '',
    sort: '-date',
    page: 1,
    limit: 20,
  },
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearTransactionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTransactionStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(getTransactionStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data;
      })
      .addCase(getTransactionStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload.data);
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(
          (t) => t._id === action.payload.data._id
        );
        if (index !== -1) {
          state.transactions[index] = action.payload.data;
        }
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (t) => t._id !== action.payload
        );
      });
  },
});

export const { setFilters, resetFilters, clearTransactionError } = transactionSlice.actions;
export default transactionSlice.reducer;

