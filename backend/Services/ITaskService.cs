using backend.DTO;

namespace backend.Services;

public interface ITaskService
{
    Task<PageResultDto<TaskDto>> GetTasksAsync(Guid userId, int page, int pageSize, bool? isCompleted);
    Task<TaskDto?> GetTaskAsync(Guid userId, Guid id);
    Task<TaskDto> CreateTaskAsync(Guid userId, CreateTaskDto dto);
    Task<TaskDto?> UpdateTaskAsync(Guid userId, Guid id, UpdateTaskDto dto);
    Task<bool> DeleteTaskAsync(Guid userId, Guid id);
}