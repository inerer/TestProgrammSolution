# 1. Этап сборки (используем тяжелый образ с SDK)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Копируем файл проекта и восстанавливаем зависимости
COPY ["backend.csproj", "./"]
RUN ls -la

RUN dotnet restore

# Копируем весь остальной код и собираем проект
COPY . .
RUN dotnet publish -c Release -o /app/publish

# 2. Этап выполнения (используем легкий образ только с ASP.NET Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Запускаем наше приложение (порт по умолчанию в .NET 8 внутри докера - 8080)
EXPOSE 8080
ENTRYPOINT ["dotnet", "backend.dll"]