using BrigadeMedicale.Application.DTOs.Auth;

namespace BrigadeMedicale.Application.Interfaces;

public interface IAuthService
{
    Task<TokenResponseDto> LoginAsync(LoginDto dto);
    Task<TokenResponseDto> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(Guid userId);
}
