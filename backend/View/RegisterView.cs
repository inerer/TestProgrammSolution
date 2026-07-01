using System.ComponentModel.DataAnnotations;

namespace backend.View;

public class RegisterView
{
    public string Email { get; set; } = string.Empty;
    
    [MinLength(8, ErrorMessage = "Пароль слишком короткий")]
    [RegularExpression("...", ErrorMessage = "Нужна хотя бы одна большая буква")]
    public string Password { get; set; } = string.Empty;
}