import fs from "fs";
import path from "path";

export interface User {
    email: string;
    password: string;
}

export interface Task {
    id: string;
    userEmail: string;  
    title: string;
    completed: boolean;
}

interface StoreData {
    users: User[];
    tasks: Task[];
}

class Store {
    private static instance: Store;
    public users: User[] = [];
    public tasks: Task[] = [];
    private dataFile: string;

    private constructor() {
        this.dataFile = path.join(process.cwd(), "data.json");
        this.loadData();
    }

    private loadData(): void {
        try {
            if (fs.existsSync(this.dataFile)) {
                const fileContent = fs.readFileSync(this.dataFile, "utf-8");
                const data: StoreData = JSON.parse(fileContent);
                this.users = data.users || [];
                this.tasks = data.tasks || [];
                console.log(`Loaded ${this.tasks.length} tasks from storage`);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            this.users = [];
            this.tasks = [];
        }
    }

    public saveData(): void {
        try {
            const data: StoreData = {
                users: this.users,
                tasks: this.tasks,
            };
            fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error("Error saving data:", error);
        }
    }

    static getInstance(): Store {
        if (!Store.instance) {
            Store.instance = new Store();
        }
        return Store.instance;
    }
}

const store = Store.getInstance();
export const users = store.users;
export const tasks = store.tasks;

export const saveStore = () => store.saveData();
