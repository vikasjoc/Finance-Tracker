import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/axios';

export const getBudgetPlan = createAsyncThunk(
  'ai/getBudgetPlan',
  async ({ message, mode }, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/ai/budget-planner', { message, mode });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to generate budget plan');
    }
  }
);

export const getInsights = createAsyncThunk(
  'ai/getInsights',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/ai/insights');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get insights');
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  'ai/sendChat',
  async ({ message, conversationId }, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/ai/chat', { message, conversationId });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Chat failed');
    }
  }
);

export const getConversations = createAsyncThunk(
  'ai/getConversations',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/ai/conversations');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch conversations');
    }
  }
);

const initialState = {
  budgetPlan: null,
  insights: [],
  conversationId: null,
  conversations: [],
  messages: [],
  summary: null,
  loading: false,
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearBudgetPlan: (state) => {
      state.budgetPlan = null;
    },
    clearChat: (state) => {
      state.messages = [];
      state.conversationId = null;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBudgetPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBudgetPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.budgetPlan = action.payload.data;
      })
      .addCase(getBudgetPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getInsights.fulfilled, (state, action) => {
        state.insights = action.payload.data.insights;
        state.summary = action.payload.data.summary;
      })
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { response, conversationId } = action.payload.data;
        state.conversationId = conversationId;
        state.messages.push(
          { role: 'assistant', content: response, timestamp: new Date().toISOString() }
        );
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.data;
      });
  },
});

export const { clearBudgetPlan, clearChat, addMessage, setMessages } = aiSlice.actions;
export default aiSlice.reducer;

