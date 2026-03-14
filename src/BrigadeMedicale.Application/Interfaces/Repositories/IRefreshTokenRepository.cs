using BrigadeMedicale.Domain.Entities;

namespace BrigadeMedicale.Application.Interfaces.Repositories;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task AddAsync(RefreshToken refreshToken);
    void Update(RefreshToken refreshToken);
    Task RevokeAllUserTokensAsync(Guid userId);
    Task<int> SaveChangesAsync();
}
