using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("tasks")]
public class TaskItem

{
    [Key] [Column("id")] public Guid Id { get; set; }

    [Required] [Column("title")] public string Title { get; set; } = string.Empty;

    [Column("description")] public string? Description { get; set; }

    [Column("is_completed")] public bool IsCompleted { get; set; }

    [Column("created_at")] public DateTime CreatedAt { get; set; }

    [Required] [Column("user_id")] public Guid UserId { get; set; }
}