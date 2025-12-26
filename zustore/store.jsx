// src/store/useUserStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; 
import api from '../src/services/api';

const useUserStore = create(

  persist(
    (set) => ({
      
      user: null,
      token: null,  // ✅ ADDED: Store token in Zustand
      
      setUser: (userData) => set({ user: userData }),
      setToken: (authToken) => {  // ✅ ADDED: Token setter
        if (authToken) {
          localStorage.setItem('authToken', authToken);
        }
        set({ token: authToken });
      },

      fetchUser: async () => {
        try {
          const res = await api.get("/api/user/profile", {
            withCredentials: true,
          });
          set({ user: res.data.user }); 
        } catch (err) {
          console.error("Error fetching user", err);
         
          set({ user: null });
        }
      },

      logout: () => {
        localStorage.removeItem('authToken');
        set({ user: null, token: null });
      },

      clearUser: () => {
        localStorage.removeItem('authToken');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'user-storage', 
      storage: createJSONStorage(() => localStorage), 
    }
  )
);

export default useUserStore;