using BrigadeMedicale.Application.DTOs.User;

namespace BrigadeMedicale.Application.Interfaces;

public interface IUserService
{
    Task<UserDto> CreateUserAsync(CreateUserDto dto);
    Task<UserDto> GetByIdAsync(Guid id);
    Task<(List<UserDto> items, int totalCount)> SearchUsersAsync(string? search, int page, int pageSize);
    Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto dto);
    Task DeleteUserAsync(Guid id);
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    Task<List<RoleDto>> GetAllRolesAsync();
}
