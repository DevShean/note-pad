"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const router = useRouter();

    const handleSignup = async () => {
        setError("");
            if (!email || !password) {
                setError("Please fill in all fields");
                return;
            }
            try {
                const res = await fetch("/api/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem("userEmail", email);
                    alert(data.message);
                    router.replace("/dashboard");
                }
                else {                    
                    setError(data.message || "Signup failed");
                }
            } catch (err) {
                setError("An error occurred during signup");
            }
    };
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900">
                <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white">Sign Up</h2>
                {error && (
                    <div className="mb-4 rounded bg-red-100 p-3 text-red-700 dark:bg-red-900 dark:text-red-100">
                        {error}
                    </div>
                )}
                <div className="mb-4"> 
                    <input
                        type="email"
                        placeholder="Username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    />
                </div>
                <div className="mb-6">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    />
                </div>
                <button onClick={handleSignup} className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600 focus:outline-none">   
                    Sign Up
                </button>

                <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Already have an account?{" "}
                    <a href="/login" className="font-medium text-black hover:underline dark:text-white">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}