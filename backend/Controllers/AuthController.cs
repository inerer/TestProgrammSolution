
using backend.DTO;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // 1. ЭНДПОИНТ РЕГИСТРАЦИИ
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
                return BadRequest("Пользователь уже существует.");

            var user = new UserItem
            {
                Id = Guid.NewGuid(), // Генерируем современный UUID
                Email = dto.Email.ToLower(),
                // Хешируем пароль с солью через BCrypt! Безопасность топ-уровня.
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Регистрация прошла успешно!" });
        }

      
    }
}