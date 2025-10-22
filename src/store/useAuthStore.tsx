// @ts-nocheck
import { createSelectorHooks } from 'auto-zustand-selectors-hook';
import { produce } from 'immer';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { removeToken, setToken } from '@/lib/cookies';
import { User, withToken } from '@/types/entities/user';

type AuthStoreType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User & withToken) => void;
  logout: () => void;
  stopLoading: () => void;
};

const useAuthStoreBase = create<AuthStoreType>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: (user) => {
        setToken(user.token);
        set(
          produce<AuthStoreType>((state) => {
            state.isAuthenticated = true;
            state.user = user;
            state.token = user.token; 
          })
        );
      },

      logout: () => {
        removeToken();
        set(
          produce<AuthStoreType>((state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
          })
        );
      },

      stopLoading: () => {
        set(
          produce<AuthStoreType>((state) => {
            state.isLoading = false;
          })
        );
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

const useAuthStore = createSelectorHooks(useAuthStoreBase);
export default useAuthStore;
