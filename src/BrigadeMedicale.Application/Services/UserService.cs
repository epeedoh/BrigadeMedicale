using BrigadeMedicale.Application.DTOs.User;
using BrigadeMedicale.Application.Interfaces;
using BrigadeMedicale.Application.Interfaces.Repositories;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Exceptions;

namespace BrigadeMedicale.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;

    public UserService(
        IUserRepository userRepository,
        IRoleRepository roleRepository)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
    {
        // Validate username uniqueness
        var existingUser = await _userRepository.GetByUsernameAsync(dto.Username);
        if (existingUser != null)
        {
            throw new ValidationException("Ce nom d'utilisateur est déjà utilisé");
        }

        // Validate email uniqueness
        existingUser = await _userRepository.GetByEmailAsync(dto.Email);
        if (existingUser != null)
        {
            throw new ValidationException("Cette adresse email est déjà utilisée");
        }

        // Validate roles exist
        var roles = await _roleRepository.GetByIdsAsync(dto.RoleIds);
        if (roles.Count != dto.RoleIds.Count)
        {
            throw new ValidationException("Un ou plusieurs rôles spécifiés n'existent pas");
        }

        // Create user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Assign roles
        foreach (var role in roles)
        {
            user.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id
            });
        }

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        // Reload with roles
        var createdUser = await _userRepository.GetByIdWithRolesAsync(user.Id);
        return MapToDto(createdUser!);
    }

    public async Task<UserDto> GetByIdAsync(Guid id)
    {
        var user = await _userRepository.GetByIdWithRolesAsync(id);
        if (user == null)
        {
            throw new NotFoundException("Utilisateur non trouvé");
        }

        return MapToDto(user);
    }

    public async Task<(List<UserDto> items, int totalCount)> SearchUsersAsync(
        string? search, int page, int pageSize)
    {
        var (users, totalCount) = await _userRepository.SearchAsync(search, page, pageSize);
        var userDtos = users.Select(MapToDto).ToList();
        return (userDtos, totalCount);
    }

    public async Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdWithRolesAsync(id);
        if (user == null)
        {
            throw new NotFoundException("Utilisateur non trouvé");
        }

        // Update email if provided and changed
        if (!string.IsNullOrEmpty(dto.Email) && dto.Email != user.Email)
        {
            var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
            if (existingUser != null && existingUser.Id != id)
            {
                throw new ValidationException("Cette adresse email est déjà utilisée");
            }
            user.Email = dto.Email;
        }

        // Update other fields
        if (!string.IsNullOrEmpty(dto.FirstName))
            user.FirstName = dto.FirstName;

        if (!string.IsNullOrEmpty(dto.LastName))
            user.LastName = dto.LastName;

        if (dto.PhoneNumber != null)
            user.PhoneNumber = dto.PhoneNumber;

        if (dto.IsActive.HasValue)
            user.IsActive = dto.IsActive.Value;

        // Update roles if provided
        if (dto.RoleIds != null && dto.RoleIds.Any())
        {
            var roles = await _roleRepository.GetByIdsAsync(dto.RoleIds);
            if (roles.Count != dto.RoleIds.Count)
            {
                throw new ValidationException("Un ou plusieurs rôles spécifiés n'existent pas");
            }

            // Remove existing roles and add new ones
            user.UserRoles.Clear();
            foreach (var role in roles)
            {
                user.UserRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = role.Id
                });
            }
        }

        user.UpdatedAt = DateTime.UtcNow;
        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();

        // Reload with roles
        var updatedUser = await _userRepository.GetByIdWithRolesAsync(id);
        return MapToDto(updatedUser!);
    }

    public async Task DeleteUserAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new NotFoundException("Utilisateur non trouvé");
        }

        // Soft delete by setting IsActive to false
        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("Utilisateur non trouvé");
        }

        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedException("Mot de passe actuel incorrect");
        }

        // Update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync();
    }

    public async Task<List<RoleDto>> GetAllRolesAsync()
    {
        var roles = await _roleRepository.GetAllAsync();
        return roles.Select(r => new RoleDto
        {
            Id = r.Id,
            Name = r.Name,
            Description = r.Description
        }).ToList();
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt,
            Roles = user.UserRoles.Select(ur => new RoleDto
            {
                Id = ur.Role.Id,
                Name = ur.Role.Name,
                Description = ur.Role.Description
            }).ToList()
        };
    }
}
