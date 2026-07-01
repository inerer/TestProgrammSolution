using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // Конструктор, который принимает настройки (например, строку подключения)

    // Это свойство представляет нашу таблицу tasks в базе данных.
    // Через него мы будем делать все LINQ-запросы (например, _context.Tasks.ToList())
    public DbSet<TaskDomain> Tasks { get; set; }
    public DbSet<UserDomain> Users { get; set; }
}