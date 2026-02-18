"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import Swal from "sweetalert2";
import { 
  CheckCircleIcon, 
  PlusCircleIcon, 
  ArrowRightStartOnRectangleIcon,
  MusicalNoteIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

interface Task {
    id: string;
    userEmail: string;
    title: string;
    completed: boolean;
}

export default function Dashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'tasks' | 'spotify'>('tasks');
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState<string>("");
    const router = useRouter();

    const successToast = (message: string) => (
        <div className="flex items-center gap-3 bg-green-50 p-4 rounded-lg">
            <Image src="/gif/rickroll-roll.gif" alt="success" width={40} height={40} />
            <span className="text-green-800 font-medium">{message}</span>
        </div>
    );

    const errorToast = (message: string) => (
        <div className="flex items-center gap-3 bg-red-50 p-4 rounded-lg">
            <Image src="/gif/rickroll-roll.gif" alt="error" width={40} height={40} />
            <span className="text-red-800 font-medium">{message}</span>
        </div>
    );

    const showSuccessToast = (message: string) => {
        toast.custom(successToast(message));
    };

    const showErrorToast = (message: string) => {
        toast.custom(errorToast(message));
    };

    const handleEditTask = (taskId: string, currentTitle: string) => {
        setEditingTaskId(taskId);
        setEditingTitle(currentTitle);
    };

    const handleSaveEdit = async (taskId: string) => {
        if (!editingTitle.trim()) {
            showErrorToast("Task title cannot be empty");
            return;
        }

        setLoadingTasks((prev) => new Set([...prev, taskId]));
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title: editingTitle }),
            });

            if (res.ok) {
                const data = await res.json();
                setTasks(
                    tasks.map((task) =>
                        task.id === taskId
                            ? { ...task, title: data.task.title }
                            : task
                    )
                );
                showSuccessToast("Task updated successfully!");
                setEditingTaskId(null);
                setEditingTitle("");
            } else {
                const error = await res.json();
                showErrorToast(`Failed to update task: ${error.message}`);
            }
        } catch (error) {
            console.error("Failed to update task:", error);
            showErrorToast("Error updating task. Check console for details.");
        } finally {
            setLoadingTasks((prev) => {
                const updated = new Set(prev);
                updated.delete(taskId);
                return updated;
            });
        }
    };

    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setEditingTitle("");
    };

    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        if (!email) {
            router.push("/login");
            return;
        }
        setUserEmail(email);
        fetchTasks();
    }, [router]);

    const fetchTasks = async () => {
        try {
            const email = localStorage.getItem("userEmail");
            if (!email) return;

            const res = await fetch(`/api/tasks?email=${encodeURIComponent(email)}`);
            if (res.ok) {
                const data = await res.json();
                setTasks(data.tasks || []);
            }
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) {
            showErrorToast("Please enter a task title");
            return;
        }

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userEmail,
                    title: newTaskTitle,
                    completed: false,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setTasks([...tasks, data.task]);
                setNewTaskTitle("");
                showSuccessToast("Task added successfully!");
            } else {
                const error = await res.json();
                showErrorToast(`Failed to add task: ${error.message}`);
            }
        } catch (error) {
            console.error("Failed to add task:", error);
            showErrorToast("Error adding task. Check console for details.");
        }
    };

    const handleToggleTask = async (taskId: string, completed: boolean) => {
        setLoadingTasks((prev) => new Set([...prev, taskId]));
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ completed: !completed }),
            });

            if (res.ok) {
                const data = await res.json();
                setTasks(
                    tasks.map((task) =>
                        task.id === taskId
                            ? { ...task, completed: data.task.completed }
                            : task
                    )
                );
                showSuccessToast(completed ? "Task marked incomplete!" : "Task completed!");
            } else {
                const error = await res.json();
                showErrorToast(`Failed to update task: ${error.message}`);
            }
        } catch (error) {
            console.error("Failed to update task:", error);
            showErrorToast("Error updating task. Check console for details.");
        } finally {
            setLoadingTasks((prev) => {
                const updated = new Set(prev);
                updated.delete(taskId);
                return updated;
            });
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        setLoadingTasks((prev) => new Set([...prev, taskId]));
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setTasks(tasks.filter((task) => task.id !== taskId));
                showSuccessToast("Task deleted successfully!");
            } else {
                const error = await res.json();
                showErrorToast(`Failed to delete task: ${error.message}`);
            }
        } catch (error) {
            console.error("Failed to delete task:", error);
            showErrorToast("Error deleting task. Check console for details.");
        } finally {
            setLoadingTasks((prev) => {
                const updated = new Set(prev);
                updated.delete(taskId);
                return updated;
            });
        }
    };


    const handleLogout = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out from your account.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#4f46e5",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Yes, logout!",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("userEmail");
                router.push("/");
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent dark:border-indigo-400"></div>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const completedCount = tasks.filter((t) => t.completed).length;
    const totalCount = tasks.length;
    const progressPercentage = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
            <Toaster position="top-right" />
            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Kupal Dashboard
                            </h1>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTab('tasks')}
                                    className={`px-4 py-2 rounded-lg transition-all ${
                                        activeTab === 'tasks'
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <ClipboardDocumentListIcon className="h-5 w-5 inline mr-2" />
                                    Tasks
                                </button>
                                <button
                                    onClick={() => setActiveTab('spotify')}
                                    className={`px-4 py-2 rounded-lg transition-all ${
                                        activeTab === 'spotify'
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <MusicalNoteIcon className="h-5 w-5 inline mr-2" />
                                    Spotify
                                </button>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="group flex items-center gap-2 rounded-lg bg-linear-to-r from-red-500 to-red-600 px-4 py-2 text-white transition-all hover:shadow-lg hover:shadow-red-200 dark:hover:shadow-red-900/30"
                            >
                                <ArrowRightStartOnRectangleIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
                {activeTab === 'tasks' ? (
                    <div className="space-y-8">
                        {/* Header Section */}
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                My Tasks
                            </h1>
                            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {userEmail}
                                </p>
                            </div>
                        </div>

                        {/* Progress Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                                    Today&apos;s Progress
                                </h2>
                                <span className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {completedCount}/{totalCount}
                                </span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                <div
                                    className="h-full bg-linear-to-r from-indigo-600 to-purple-600 transition-all duration-500 rounded-full"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                {totalCount === 0 
                                    ? "Add your first task to get started!" 
                                    : `${completedCount} of ${totalCount} tasks completed`}
                            </p>
                        </div>

                        {/* Add Task Form */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Create New Task
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    placeholder="What needs to be done?"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
                                    className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={handleAddTask}
                                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white font-medium transition-all hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30"
                                >
                                    <PlusCircleIcon className="h-5 w-5 transition-transform group-hover:rotate-90" />
                                    <span>Add Task</span>
                                </button>
                            </div>
                        </div>

                        {/* Task List */}
                        <div className="space-y-3">
                            <h2 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Your Tasks ({tasks.length})
                            </h2>
                            
                            {tasks.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <ClipboardDocumentListIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                                        No tasks yet. Create your first task above!
                                    </p>
                                </div>
                            ) : (
                                tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-4 border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleToggleTask(task.id, task.completed)}
                                                disabled={loadingTasks.has(task.id)}
                                                className="shrink-0"
                                            >
                                                {task.completed ? (
                                                    <CheckCircleSolid className="h-6 w-6 text-green-500" />
                                                ) : (
                                                    <CheckCircleIcon className="h-6 w-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                                )}
                                            </button>
                                            
                                            {editingTaskId === task.id ? (
                                                <div className="flex-1 flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={editingTitle}
                                                        onChange={(e) => setEditingTitle(e.target.value)}
                                                        className="flex-1 rounded border border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 text-gray-900 dark:text-white focus:outline-none"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleSaveEdit(task.id)}
                                                        className="px-2 py-1 rounded bg-green-500 text-white text-sm hover:bg-green-600"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="px-2 py-1 rounded bg-gray-300 text-gray-700 text-sm hover:bg-gray-400"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span
                                                        className={`flex-1 text-lg ${
                                                            task.completed
                                                                ? "line-through text-gray-400 dark:text-gray-600"
                                                                : "text-gray-900 dark:text-white"
                                                        }`}
                                                    >
                                                        {task.title}
                                                    </span>
                                                    
                                                    <button
                                                        onClick={() => handleEditTask(task.id, task.title)}
                                                        disabled={loadingTasks.has(task.id)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <PencilIcon className="h-5 w-5 text-blue-500 hover:text-blue-600 transition-colors" />
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        disabled={loadingTasks.has(task.id)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        {loadingTasks.has(task.id) ? (
                                                            <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />
                                                        ) : (
                                                            <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-600 transition-colors" />
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    /* spotify section */
                    <div className="space-y-8">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Music for Focus
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                                Boost your productivity with the perfect soundtrack
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                            <div className="aspect-video max-w-3xl mx-auto">
                                <iframe
                                    className="w-full h-full rounded-xl shadow-2xl"
                                    src="https://open.spotify.com/embed/track/6G9YlbU3ByPJQvOFDRdwyM?utm_source=generator"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}