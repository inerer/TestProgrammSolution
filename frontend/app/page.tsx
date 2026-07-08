"use client";

import { useState, useEffect } from "react";
import AuthForm from "../components/AuthForm";

interface Task {
    id: string;
    title: string;
    description?: string;
    isCompleted: boolean;
}

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // НОВОЕ: Состояние для поля ввода новой задачи
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/tasks", {
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            } else if (res.status === 401) {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Ошибка при загрузке задач:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchTasks();
        }
    }, [isAuthenticated]);

    // НОВОЕ: Функция создания задачи
    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы при отправке формы
        if (!newTaskTitle.trim()) return; // Не даем создать пустую задачу

        try {
            const res = await fetch("http://localhost:8080/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Не забываем наш паспорт!
                body: JSON.stringify({
                    title: newTaskTitle,
                    description: "" // Пока отправляем пустое описание
                }),
            });

            if (res.ok) {
                const createdTask = await res.json();
                // Магия React: берем старый массив задач и добавляем в конец новую
                setTasks((prev) => [...prev, createdTask]);
                setNewTaskTitle(""); // Очищаем поле ввода
            }
        } catch (error) {
            console.error("Ошибка при создании:", error);
        }
    };

    // НОВОЕ: Функция удаления задачи
    const handleDeleteTask = async (taskId: string) => {
        try {
            const res = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.ok) {
                // Если бэкенд удалил успешно, убираем задачу из памяти фронтенда
                setTasks((prev) => prev.filter((task) => task.id !== taskId));
            }
        } catch (error) {
            console.error("Ошибка при удалении:", error);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <AuthForm onLoginSuccess={() => setIsAuthenticated(true)} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Мои задачи</h1>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="text-sm text-red-500 hover:underline border border-red-500 px-3 py-1 rounded"
                    >
                        Выйти
                    </button>
                </div>

                {/* НОВОЕ: Форма добавления задачи */}
                <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Что нужно сделать?"
                        className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
                    >
                        Добавить
                    </button>
                </form>

                {isLoading ? (
                    <p className="text-center text-gray-500">Загрузка задач...</p>
                ) : tasks.length === 0 ? (
                    <p className="text-center text-gray-500">У вас пока нет задач. Создайте первую!</p>
                ) : (
                    <ul className="space-y-3">
                        {tasks.map((task) => (
                            <li key={task.id} className="p-4 border border-gray-200 rounded flex justify-between items-center bg-gray-50">
                                <div className="flex items-center gap-3">
                                    {/*<div className="w-5 h-5 rounded border border-gray-400 bg-white"></div>*/}
                                    <h3 className="font-medium text-gray-800">{task.title}</h3>
                                </div>
                                {/* НОВОЕ: Кнопка удаления */}
                                <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                >
                                    Удалить
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}