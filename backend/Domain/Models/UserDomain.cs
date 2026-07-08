using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("users")]
    public class UserDomain 
    {
        [Key] 
        [Column("id")] 
        public Guid Id { get; set; }

        [Required] 
        [Column("email")] 
        public string Email { get; set; } = string.Empty;
        
        [Required] 
        [Column("password_hast")] 
        public string PasswordHash { get; set; } = string.Empty;

        [Column("created_at")] 
        public DateTime CreatedAt { get; set; }
    }
}