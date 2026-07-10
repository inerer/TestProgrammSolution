"use client";

import {useState, useEffect} from "react";
import AuthForm from "@/components/AuthForm";

interface Task {
    id: string;
    title: string;
    description?: string;
    isCompleted: boolean;
}

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [logout, setLogout] = useState(false);

    // ИСПРАВЛЕНО: изначально true, чтобы при перезагрузке сначала шла проверка токена
    const [isLoading, setIsLoading] = useState(true);

    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    // Функция загрузки задач (она же — проверка валидности токена)

    const handleLogout = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/auth/logout", {
                method: "POST",
                credentials: "include", // СВЕРХВАЖНО: чтобы бэкенд понял, чью именно куку надо удалить!
            });

            if (res.ok) {
                setIsAuthenticated(false);
                setTasks([]); // На всякий случай чистим задачи из памяти фронтенда
            }
        } catch (error) {
            console.error("Ошибка при выходе:", error);
        }
        
    }
    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/tasks", {
                credentials: "include", // Отправляем куку-паспорт на бэкенд
            });

            if (res.ok) {
                const data = await res.json();
                setTasks(data);
                setIsAuthenticated(true); // ИСПРАВЛЕНО: Если бэкенд отдал задачи, значит токен живой! Авто-вход!
            } else if (res.status === 401) {
                setIsAuthenticated(false); // Токен протух или его нет
            }
        } catch (error) {
            console.error("Ошибка при проверке авторизации:", error);
        } finally {
            setIsLoading(false); // Выключаем лоадер проверки
        }
    };

    // ЭФФЕКТ: Срабатывает СТРОГО один раз при рождении (или перезагрузке) страницы
    useEffect(() => {
        fetchTasks();
    }, []); // Пустой массив зависимостей = запуск при старте

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            const res = await fetch("http://localhost:8080/api/tasks", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({title: newTaskTitle, description: ""}),
            });
            if (res.ok) {
                const createdTask = await res.json();
                setTasks((prev) => [...prev, createdTask]);
                setNewTaskTitle("");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            const res = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleComplete = async (task: Task) => {
        try {
            const res = await fetch(`http://localhost:8080/api/tasks/${task.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({...task, isCompleted: !task.isCompleted}),
            });
            if (res.ok) {
                const updatedTask = await res.json();
                setTasks((prev) => prev.map((t) => t.id === task.id ? updatedTask : t));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveEdit = async (task: Task) => {
        if (!editTitle.trim()) return;
        try {
            const res = await fetch(`http://localhost:8080/api/tasks/${task.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({...task, title: editTitle}),
            });
            if (res.ok) {
                const updatedTask = await res.json();
                setTasks((prev) => prev.map((t) => t.id === task.id ? updatedTask : t));
                setEditingId(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // 1. Сначала ждем, пока бэкенд ответит, жива ли кука
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 font-medium animate-pulse">Проверка авторизации...</p>
            </div>
        );
    }

    // 2. Если проверка прошла и мы НЕ авторизованы — показываем форму входа
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                {/* Когда юзер успешно зайдет руками, меняем стейт и качаем задачи */}
                <AuthForm onLoginSuccess={() => {
                    setIsAuthenticated(true);
                    fetchTasks();
                }}/>
            </div>
        );
    }

    // 3. Если авторизованы — показываем наше приложение
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Мои задачи</h1>
                    <button onClick={handleLogout}
                            className="text-sm text-red-500 hover:underline border border-red-500 px-3 py-1 rounded">Выйти
                    </button>
                </div>

                <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
                    <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                           placeholder="Что нужно сделать?"
                           className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <button type="submit"
                            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition">Добавить
                    </button>
                </form>

                {tasks.length === 0 ? <p className="text-center text-gray-500">Нет задач</p> : (
                    <ul className="space-y-3">
                        {tasks.map((task) => (
                            <li key={task.id}
                                className={`p-4 border rounded flex justify-between items-center transition ${task.isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>

                                <div className="flex items-center gap-3 flex-1">
                                    <input
                                        type="checkbox"
                                        checked={task.isCompleted}
                                        onChange={() => handleToggleComplete(task)}
                                        className="w-5 h-5 cursor-pointer rounded border-gray-400 text-green-600 focus:ring-green-500"
                                    />

                                    {editingId === task.id ? (
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onBlur={() => handleSaveEdit(task)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(task)}
                                            autoFocus
                                            className="flex-1 p-1 border border-blue-400 rounded focus:outline-none"
                                        />
                                    ) : (
                                        <h3
                                            onDoubleClick={() => {
                                                setEditingId(task.id);
                                                setEditTitle(task.title);
                                            }}
                                            className={`font-medium cursor-text flex-1 ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                                        >
                                            {task.title}
                                        </h3>
                                    )}
                                </div>

                                <button onClick={() => handleDeleteTask(task.id)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium ml-4">Удалить
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}