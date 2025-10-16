import { defineStore } from "pinia";
import type { User } from "better-auth";

export const useUserStore = defineStore("user", {
  state: (): { user: User | null } => ({ user: null }),
  actions: {
    setUser(user: User | null) {
      this.user = user;
    },
    clearUser() {
      console.log("Clearing user");
      this.user = null;
    },
  },
});
