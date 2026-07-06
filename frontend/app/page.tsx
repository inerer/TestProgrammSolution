"use client"

import {useEffect, useState} from "react";
import AuthForm from "../components/AuthForm";

interface Task {
    id: number;
    title: string;
    description: string;
    isComplete: boolean;
}

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const fetchTasks = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/tasks", {
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            } else if (response.status === 401) {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.log("ошибка при получении данных", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchTasks();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <AuthForm onLoginSuccess={() => setIsAuthenticated(true)}/>
            </div>
        )
    }

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const res = await fetch("http://localhost:8080/api/tasks", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({title: newTaskTitle, description: "", isComplete: false}),
        });

        if (res.ok) {
            setNewTaskTitle("");
            fetchTasks()
        }
    };

    const toggleTask = async (id: number, currentStatus: boolean) => {
        const res = await fetch(`http://localhost:8080/api/Tasks/${id}/toggle`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(!currentStatus),
        });
        if (res.ok) fetchTasks();
    };

    const deleteTask = async (id: number) => {
        const res = await fetch(`http://localhost:8080/api/tasks/${id}`, {
            method: "DELETE",
        });
        if (res.ok) fetchTasks();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Мои задачи</h1>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="text-sm text-red-500 hover:underline"
                    >
                        Выйти
                    </button>
                </div>

                {isLoading ? (
                    <p className="text-center text-gray-500">Загрузка задач...</p>
                ) : tasks.length === 0 ? (
                    <p className="text-center text-gray-500">У вас пока нет задач. Создайте первую!</p>
                ) : (
                    <ul className="space-y-3">
                        {tasks.map((task) => (
                            <li key={task.id} className="p-4 border border-gray-200 rounded flex justify-between">
                                <div>
                                    <h3 className="font-semibold">{task.title}</h3>
                                    <p className="text-sm text-gray-600">{task.description}</p>
                                </div>
                                <div>
                                    {task.isComplete ? "✅" : "⏳"}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}