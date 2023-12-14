import { create } from 'zustand';

interface Username {
  username: string;
  setUsername: (newUsername: string) => void;
}

const useStore = create<Username>((set) => ({
  username: '',
  setUsername: (newUsername: string) => set({ username: newUsername }),
}));

export default useStore;
