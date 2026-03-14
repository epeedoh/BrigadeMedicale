using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BrigadeMedicale.Application.DTOs.User;
using BrigadeMedicale.Application.Interfaces;

namespace BrigadeMedicale.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var (items, totalCount) = await _userService.SearchUsersAsync(search, page, pageSize);

        return Ok(new
        {
            success = true,
            data = new
            {
                items = items,
                pagination = new
                {
                    currentPage = page,
                    pageSize = pageSize,
                    totalItems = totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    hasNextPage = page * pageSize < totalCount,
                    hasPreviousPage = page > 1
                }
            }
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _userService.GetByIdAsync(id);
        return Ok(new { success = true, data = result });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        var result = await _userService.CreateUserAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            new { success = true, data = result, message = "Utilisateur créé avec succès" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto)
    {
        var result = await _userService.UpdateUserAsync(id, dto);
        return Ok(new { success = true, data = result, message = "Utilisateur mis à jour avec succès" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _userService.DeleteUserAsync(id);
        return Ok(new { success = true, message = "Utilisateur désactivé avec succès" });
    }

    [HttpPost("{id}/change-password")]
    [Authorize] // Any authenticated user can change their own password
    public async Task<IActionResult> ChangePassword(Guid id, [FromBody] ChangePasswordDto dto)
    {
        // Users can only change their own password unless they're admin
        var currentUserId = Guid.Parse(User.FindFirst("sub")?.Value ?? Guid.Empty.ToString());
        var isAdmin = User.IsInRole("ADMIN");

        if (id != currentUserId && !isAdmin)
        {
            return Forbid();
        }

        await _userService.ChangePasswordAsync(id, dto);
        return Ok(new { success = true, message = "Mot de passe modifié avec succès" });
    }

    [HttpGet("roles")]
    [Authorize] // Any authenticated user can see available roles
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _userService.GetAllRolesAsync();
        return Ok(new { success = true, data = roles });
    }
}
