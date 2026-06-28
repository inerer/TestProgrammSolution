"use client"

import {useEffect, useState} from "react";

interface Task {
    id: number;
    title: string;
    description: string;
    isComplete: boolean;
}

export default function Home() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const fetchTasks = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/tasks");
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            }
        } catch (error) {
            console.log("ошибка при получении данных", error);
        }
    };

    useEffect(() => {

        fetchTasks();
    }, []);

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
        <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
            <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6">
                <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">Задачи</h1>
                <form onSubmit={addTask} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Что нужно сделать?"
                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Добавить
                    </button>
                </form>
                <ul className="space-y-3">
                    {tasks.length === 0 ? (
                        <p className={"text-center text-gray-500"}> Задач нет!</p>) : (
                        tasks.map((task) => (
                            <li key={task.id}
                                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox"
                                           checked={task.isComplete}
                                           onChange={() => toggleTask(task.id, task.isComplete)}
                                           className="w-5 h-5 cursor-pointer accent-blue-600"/>
                                    <span
                                        className={`${task.isComplete ? "line-through text-gray-400" : "text-gray-800"}`}>
                                        {task.title}
                                    </span>
                                </div>
                                <button onClick={() => deleteTask(task.id)}
                                        className="text-red-500 hover:text-red-700 font-medium px-2 py-1">
                                    Удалить
                                </button>
                            </li>
                        ))
                    )
                    }
                </ul>
            </div>
        </main>
    );
}