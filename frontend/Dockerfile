# Используем легковесный образ Node.js
FROM node:20-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы зависимостей и устанавливаем их
COPY package.json package-lock.json* ./
RUN npm install

# Копируем весь остальной код фронтенда
COPY . .

# Собираем оптимизированную production-версию Next.js
RUN npm run build

# Открываем порт 3000
EXPOSE 3000

# Команда для запуска сервера
CMD ["npm", "start"]