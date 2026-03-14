namespace BrigadeMedicale.Application.DTOs.User;

public class UpdateUserDto
{
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public bool? IsActive { get; set; }
    public List<int>? RoleIds { get; set; }
}
