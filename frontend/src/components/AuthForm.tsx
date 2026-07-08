"use client";

import { useState } from "react";

// Пропс onLoginSuccess передаст главной странице сигнал, что мы успешно вошли
export default function AuthForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

        try {
            const res = await fetch(`http://localhost:8080${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                if (isLogin) {
                    onLoginSuccess(); // Если это был логин — пускаем юзера к задачам
                } else {
                    // Если это была регистрация — переключаем на форму входа
                    setIsLogin(true);
                    setEmail("");
                    setPassword("");
                    alert("Регистрация успешна! Теперь войдите.");
                }
            } else {
                const errText = await res.text();
                setError(errText || "Произошла ошибка");
            }
        } catch (err) {
            setError("Ошибка соединения с сервером");
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
                {isLogin ? "Вход в систему" : "Регистрация"}
            </h2>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                >
                    {isLogin ? "Войти" : "Зарегистрироваться"}
                </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
                {isLogin ? "Нет аккаунта? " : "Уже есть аккаунт? "}
                <button
                    onClick={() => { setIsLogin(!isLogin); setError(""); }}
                    className="text-blue-600 font-medium hover:underline"
                >
                    {isLogin ? "Создать" : "Войти"}
                </button>
            </p>
        </div>
    );
}