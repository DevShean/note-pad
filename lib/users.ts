export interface User {
    email: string;
    password: string;
}

// Re-export from store for persistence
export { users, saveStore } from "./store";


