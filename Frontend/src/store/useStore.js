import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const useStore = create((set) => ({
  // State
  profiles: [],
  events: [],
  currentProfile: null,
  loading: false,
  error: null,

  // Profile Actions
  fetchProfiles: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/profiles`);
      set({ profiles: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/profiles`, profileData);
      set((state) => ({
        profiles: [...state.profiles, response.data],
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProfileTimezone: async (profileId, timezone) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(`${API_URL}/profiles/${profileId}/timezone`, { timezone });
      set((state) => ({
        profiles: state.profiles.map(p => p._id === profileId ? response.data : p),
        currentProfile: state.currentProfile?._id === profileId ? response.data : state.currentProfile,
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  setCurrentProfile: (profile) => {
    set({ currentProfile: profile });
  },

  // Event Actions
  fetchEvents: async (profileId = null) => {
    set({ loading: true, error: null });
    try {
      const url = profileId 
        ? `${API_URL}/events/profile/${profileId}`
        : `${API_URL}/events`;
      const response = await axios.get(url);
      set({ events: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createEvent: async (eventData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/events`, eventData);
      set((state) => ({
        events: [...state.events, response.data],
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateEvent: async (eventId, eventData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/events/${eventId}`, eventData);
      set((state) => ({
        events: state.events.map(e => e._id === eventId ? response.data : e),
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteEvent: async (eventId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/events/${eventId}`);
      set((state) => ({
        events: state.events.filter(e => e._id !== eventId),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

export default useStore;
