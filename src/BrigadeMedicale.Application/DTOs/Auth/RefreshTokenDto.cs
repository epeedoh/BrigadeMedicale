using System.ComponentModel.DataAnnotations;

namespace BrigadeMedicale.Application.DTOs.Auth;

public class RefreshTokenDto
{
    [Required(ErrorMessage = "Le refresh token est requis")]
    public string RefreshToken { get; set; } = string.Empty;
}
