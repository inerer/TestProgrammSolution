using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("users")]
    public class UserItem // Имя класса User или UserItem — на твой вкус, оба ок!
    {
        [Key] 
        [Column("id")] 
        public Guid Id { get; set; }

        [Required] 
        [Column("email")] 
        public string Email { get; set; } = string.Empty;

        // ИСПРАВЛЕНО: Храним хеш, а не сам пароль, и связываем с правильной колонкой
        [Required] 
        [Column("password_hash")] 
        public string PasswordHash { get; set; } = string.Empty;

        [Column("created_at")] 
        public DateTime CreatedAt { get; set; }
    }
}