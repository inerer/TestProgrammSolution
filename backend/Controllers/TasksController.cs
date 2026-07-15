using System.Security.Claims;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")] // Это сделает URL эндпоинта доступным по адресу /api/tasks
public class TasksController(AppDbContext context) : ControllerBase
{
    private readonly AppDbContext _context = context;

    private Guid CurrentUserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskDomain>>> GetTasks()
    {
        var tasks = await _context.Tasks.Where(t => t.UserId == CurrentUserId).ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskDomain>> GetTask(Guid id)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == CurrentUserId);
        if (task == null) return NotFound(new { message = "Task Not Found" });

        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskDomain>> CreateItem([FromBody] TaskDomain task)
    {
        task.Id = Guid.NewGuid(); // Генерируем UUID задачи
        task.UserId = CurrentUserId; // Намертво привязываем задачу к текущему юзеру!
        task.CreatedAt = DateTime.UtcNow;
        _context.Tasks.Add(task);

        await _context.SaveChangesAsync();
        return CreatedAtAction("GetTask", new { id = task.Id }, task);
    }

    [HttpPut("{id}/toggle")]
    public async Task<IActionResult> ToggleTaskStatus(Guid id, [FromBody] TaskDomain updatedTask)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == CurrentUserId);
        if (task == null) return NotFound(new { message = "Task Not Found" });

        task.Title = updatedTask.Title;
        task.Description = updatedTask.Description;
        task.IsCompleted = updatedTask.IsCompleted;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        // Ищем задачу по ID И проверяем, что она принадлежит этому юзеру
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == CurrentUserId);

        if (task == null) return NotFound("Задача не найдена или у вас нет прав.");

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}