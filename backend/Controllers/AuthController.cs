using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Models;
using backend.View;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;


namespace backend.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // 1. ЭНДПОИНТ РЕГИСТРАЦИИ
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterView view)
        {
            if (await _context.Users.AnyAsync(u => u.Email == view.Email.ToLower()))
                return BadRequest("Пользователь уже существует.");

            var user = new UserDomain
            {
                Id = Guid.NewGuid(),
                Email = view.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(view.Password),
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Регистрация прошла успешно!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(AuthView view)
        {
            
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == view.Email.ToLower());
            if (user == null || !BCrypt.Net.BCrypt.Verify(view.Password, user.PasswordHash))
                return Unauthorized("Неверный Емейл или пароль");

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"]  // или _configuration["Jwt:Key"] в контроллере
                         ?? throw new InvalidOperationException("Jwt:Key не задан в конфигурации");
            var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity([
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()) // Юзер ID (GUID)
                ]),
                Expires = DateTime.UtcNow.AddDays(7), // Токен живет неделю
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // УПАКОВЫВАЕМ JWT В КУКУ С ФЛАГОМ httpOnly! JavaScript до нее не доберется!
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true, // Защита от XSS атак
                Secure = false, // Ставим true на настоящем сервере с HTTPS (для локалхоста пока false)
                SameSite = SameSiteMode.Lax, // Защита от CSRF атак
                Expires = DateTime.UtcNow.AddDays(7)
            };

            Response.Cookies.Append("X-Access-Token", tokenString, cookieOptions);

            return Ok(new { message = "Вход выполнен успешно!", email = user.Email });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("X-Access-Token");
            return Ok(new { message = "Вы вышли из системы." });
        }
    }
}