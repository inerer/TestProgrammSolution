using System.Text;
using backend;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;


var builder = WebApplication.CreateBuilder(args);

// 1. Подключаем контроллеры и CORS
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001") // Наш фронтенд в Докере
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); // ОБЯЗАТЕЛЬНО для передачи кук!
    });
});

// 2. Подключаем базу данных
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. НАСТРОЙКА СЕКРЕТНОГО КЛЮЧА JWT (В реальном проде его берут из конфигов)
var jwtKey = builder.Configuration["Jwt:Key"]  // или _configuration["Jwt:Key"] в контроллере
             ?? throw new InvalidOperationException("Jwt:Key не задан в конфигурации");
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

// 4. НАСТРОЙКА БЕЗОПАСНОЙ АУТЕНТИФИКАЦИИ
builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false, // Для локальной разработки отключаем проверку издателя
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ClockSkew = TimeSpan.Zero
        };

        // МАГИЯ КУК: Извлекаем JWT-токен прямо из входящих Cookie
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies["X-Access-Token"];
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// ВАЖНО: Порядок middleware имеет критическое значение!
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseAuthentication(); // 1. Проверяем КТО зашел (Кука -> JWT)
app.UseAuthorization(); // 2. Проверяем КУДА ему можно

app.MapControllers();

app.Run();