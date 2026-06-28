using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")] // Это сделает URL эндпоинта доступным по адресу /api/tasks
public class TasksController(AppDbContext context) : ControllerBase
{
    private readonly AppDbContext _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
    {
        var tasks = await _context.Tasks.OrderByDescending(t => t.Id).ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetTask(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return NotFound(new { message = "Task Not Found" });

        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateItem([FromBody] TaskItem task)
    {
        _context.Tasks.Add(task);

        await _context.SaveChangesAsync();
        return CreatedAtAction("GetTask", new { id = task.Id }, task);
    }

    [HttpPut("{id}/toggle")]
    public async Task<IActionResult> ToggleTaskStatus(int id, [FromBody] bool isCompleted)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return NotFound(new { message = "Task Not Found" });

        task.IsCompleted = isCompleted;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return NotFound(new { message = "Task Not Found" });

        _context.Tasks.Remove(task);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}