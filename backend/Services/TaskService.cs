using backend.DTO;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class TaskService(AppDbContext context, ILogger<TaskService> logger) : ITaskService
{
    private readonly ILogger<TaskService> _logger = logger;
    private readonly AppDbContext _context = context;

    private const int MaxPageSize = 100;
    private const int DefaultPageSize = 20;

    public async Task<PageResultDto<TaskDto>> GetTasksAsync(Guid userId, int page, int pageSize, bool? isCompleted)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > MaxPageSize ? DefaultPageSize : pageSize;

        var query = _context.Tasks.Where(t => t.UserId == userId);

        if (isCompleted.HasValue)
            query = query.Where(t => t.IsCompleted == isCompleted.Value);

        var totalCount = await query.CountAsync();
        var entities = await query.OrderBy(t => t.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var items = entities.Select(ToDto).ToList();

        _logger.LogInformation(
            "Пользователь {UserId} запросил задачи: страница {Page}, размер {PageSize}, найдено {TotalCount}",
            userId, page, pageSize, totalCount);

        return new PageResultDto<TaskDto> { Items = items, Page = page, PageSize = pageSize, TotalCount = totalCount };
    }

    public Task<TaskDto?> GetTaskAsync(Guid userId, Guid id)
    {
        throw new NotImplementedException();
    }

    public Task<TaskDto> CreateTaskAsync(Guid userId, CreateTaskDto dto)
    {
        throw new NotImplementedException();
    }

    public Task<TaskDto?> UpdateTaskAsync(Guid userId, Guid id, UpdateTaskDto dto)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteTaskAsync(Guid userId, Guid id)
    {
        throw new NotImplementedException();
    }

    private static TaskDto ToDto(TaskDomain task) => new()
    {
        Id = task.Id, Title = task.Title, Description = task.Description,
        IsCompleted = task.IsCompleted, CreatedAt = task.CreatedAt
    };
}