# LIVRABLE 4 : AUTHENTIFICATION & RBAC DÉTAILLÉ

**Projet** : Brigade Médicale - Application de gestion médicale terrain
**Date** : 2026-01-24
**Version** : 1.0
**Statut** : En attente de validation

---

## AJUSTEMENTS INTÉGRÉS (suite validation LIVRABLE 3)

✅ **Refresh token dédié** : Système access/refresh séparé pour Staff
✅ **X-Patient-Token privilégié** : Header obligatoire (query param fallback)
✅ **Endpoint clôture parcours** : `POST /api/staff/patients/{id}/close-visit`

---

## 1. VUE D'ENSEMBLE SYSTÈME AUTHENTIFICATION

```
┌──────────────────────────────────────────────────────────────┐
│                   MÉCANISMES D'AUTHENTIFICATION               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. STAFF (Personnel médical)                                │
│     ├─ Access Token JWT (courte durée : 15min)               │
│     ├─ Refresh Token JWT (longue durée : 7 jours)            │
│     ├─ Stockage : HttpOnly Cookie (refresh) + LocalStorage   │
│     └─ RBAC : 6 rôles (ADMIN, ACCUEIL, MEDECIN...)           │
│                                                               │
│  2. PATIENT (Sans compte)                                    │
│     ├─ Access Token (30 jours, révocable)                    │
│     ├─ Header : X-Patient-Token (prioritaire)                │
│     ├─ Fallback : Query param ?token=...                     │
│     └─ Permissions : Lecture seule dossier personnel         │
│                                                               │
│  3. PUBLIC (Anonyme)                                         │
│     └─ Routes /api/public/* sans authentification            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. AUTHENTIFICATION STAFF (JWT DUAL TOKEN)

### 2.1 Architecture tokens

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX AUTHENTIFICATION STAFF               │
└─────────────────────────────────────────────────────────────┘

    ┌─────────┐                  ┌──────────┐
    │  Client │                  │   API    │
    └────┬────┘                  └────┬─────┘
         │                            │
         │ POST /api/auth/login       │
         │ {username, password}       │
         ├───────────────────────────>│
         │                            │
         │                            │ Validation credentials
         │                            │ Génération Access + Refresh
         │                            │
         │ {accessToken, user}        │
         │ Set-Cookie: refreshToken   │
         │<───────────────────────────┤
         │                            │
         │ Stockage :                 │
         │ - accessToken → localStorage
         │ - refreshToken → HttpOnly Cookie
         │                            │
         │ GET /api/staff/patients    │
         │ Authorization: Bearer {AT} │
         ├───────────────────────────>│
         │                            │
         │                            │ Validation JWT
         │                            │ Extraction rôles
         │                            │ Vérification permissions
         │                            │
         │ {patients[]}               │
         │<───────────────────────────┤
         │                            │
         │ (Access token expire)      │
         │                            │
         │ POST /api/auth/refresh     │
         │ Cookie: refreshToken       │
         ├───────────────────────────>│
         │                            │
         │                            │ Validation refresh token
         │                            │ Génération nouvel Access
         │                            │
         │ {accessToken}              │
         │<───────────────────────────┤
```

---

### 2.2 Endpoints authentification Staff

#### `POST /api/auth/login`

**Request** :
```json
{
  "username": "dr.jean.dupont",
  "password": "SecureP@ssw0rd",
  "rememberMe": true
}
```

**Response 200** :
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNDdhYzEwYi01OGNjLTQzNzItYTU2Ny0wZTAyYjJjM2Q0NzkiLCJ1c2VybmFtZSI6ImRyLmplYW4uZHVwb250Iiwicm9sZXMiOlsiTUVERUNJTiJdLCJleHAiOjE3Mzc3MTU1MDAsImlhdCI6MTczNzcxNDYwMH0...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "username": "dr.jean.dupont",
      "email": "jean.dupont@brigade.org",
      "firstName": "Jean",
      "lastName": "Dupont",
      "roles": ["MEDECIN"]
    }
  }
}
```

**Headers Response** :
```
Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...;
            HttpOnly;
            Secure;
            SameSite=Strict;
            Path=/api/auth/refresh;
            Max-Age=604800
```

**Durées** :
- `accessToken` : 15 minutes (900s)
- `refreshToken` : 7 jours si `rememberMe=true`, sinon 24h

---

#### `POST /api/auth/refresh`

**Headers Request** :
```
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200** :
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

**Erreurs** :
- `401` : Refresh token invalide/expiré
- `403` : Compte désactivé

---

#### `POST /api/auth/logout`

**Description** : Révocation refresh token

**Headers Request** :
```
Authorization: Bearer {accessToken}
Cookie: refreshToken=...
```

**Response 204** : No Content

**Actions serveur** :
1. Ajout refresh token à blacklist (Redis ou table DB)
2. Suppression cookie
3. Log audit sécurité

---

### 2.3 Structure JWT Tokens

#### Access Token (JWT)

**Header** :
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** :
```json
{
  "sub": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "username": "dr.jean.dupont",
  "email": "jean.dupont@brigade.org",
  "roles": ["MEDECIN"],
  "iat": 1737714600,
  "exp": 1737715500,
  "jti": "unique-token-id"
}
```

**Claims** :
- `sub` : User ID
- `username` : Login
- `roles` : Liste des rôles (array)
- `iat` : Issued At (timestamp)
- `exp` : Expiration (timestamp)
- `jti` : JWT ID (révocation)

---

#### Refresh Token (JWT)

**Payload** :
```json
{
  "sub": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "tokenType": "refresh",
  "iat": 1737714600,
  "exp": 1738319400,
  "jti": "refresh-unique-id"
}
```

**Stockage** :
- HttpOnly Cookie (protection XSS)
- SameSite=Strict (protection CSRF)
- Secure (HTTPS uniquement)

---

### 2.4 Blacklist Tokens (révocation)

**Table** : `RevokedTokens` (optionnel, si pas Redis)

| Colonne | Type | Description |
|---------|------|-------------|
| Jti | NVARCHAR(255) | JWT ID (unique) |
| ExpiresAt | DATETIME2 | Expiration originale |
| RevokedAt | DATETIME2 | Date révocation |
| Reason | NVARCHAR(50) | LOGOUT, SECURITY, ADMIN_ACTION |

**Nettoyage** : Job quotidien supprime tokens expirés

---

## 3. AUTHENTIFICATION PATIENT (TOKEN SIMPLE)

### 3.1 Flux authentification patient

```
┌─────────┐                  ┌──────────┐
│ Patient │                  │   API    │
└────┬────┘                  └────┬─────┘
     │                            │
     │ POST /api/public/patients/register
     │ {firstName, lastName...}   │
     ├───────────────────────────>│
     │                            │
     │                            │ Création patient
     │                            │ Génération token
     │                            │ Génération QR code
     │                            │
     │ {patientId, accessToken,   │
     │  qrCodeDataUrl}            │
     │<───────────────────────────┤
     │                            │
     │ Stockage token patient     │
     │ (localStorage ou papier)   │
     │                            │
     │ GET /api/patients/me       │
     │ X-Patient-Token: pt_2026_xyz
     ├───────────────────────────>│
     │                            │
     │                            │ Validation token
     │                            │ Vérification expiration
     │                            │ Vérification révocation
     │                            │
     │ {patient data}             │
     │<───────────────────────────┤
```

---

### 3.2 Format token patient

**Structure** : `pt_{YEAR}_{RANDOM_GUID_SHORT}`

**Exemple** : `pt_2026_a1b2c3d4e5f67890`

**Génération** :
```csharp
var token = $"pt_{DateTime.UtcNow.Year}_{Guid.NewGuid().ToString("N").Substring(0, 16)}";
```

**Stockage DB** : Table `PatientAccessTokens` (voir LIVRABLE 2)

---

### 3.3 Validation token patient

**Middleware ASP.NET Core** :

```csharp
public class PatientTokenMiddleware
{
    private readonly RequestDelegate _next;

    public async Task InvokeAsync(HttpContext context, IPatientTokenService tokenService)
    {
        // 1. Priorité : Header X-Patient-Token
        var token = context.Request.Headers["X-Patient-Token"].FirstOrDefault();

        // 2. Fallback : Query parameter
        if (string.IsNullOrEmpty(token))
        {
            token = context.Request.Query["token"].FirstOrDefault();
        }

        if (!string.IsNullOrEmpty(token))
        {
            var validationResult = await tokenService.ValidateTokenAsync(token);

            if (validationResult.IsValid)
            {
                // Injection PatientId dans HttpContext
                context.Items["PatientId"] = validationResult.PatientId;
            }
            else
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    error = new
                    {
                        code = validationResult.ErrorCode, // TOKEN_EXPIRED, TOKEN_REVOKED
                        message = validationResult.ErrorMessage
                    }
                });
                return;
            }
        }

        await _next(context);
    }
}
```

---

### 3.4 Service validation token

```csharp
public interface IPatientTokenService
{
    Task<TokenValidationResult> ValidateTokenAsync(string token);
    Task<string> GenerateTokenAsync(Guid patientId, int expiresInDays = 30);
    Task RevokeTokenAsync(Guid tokenId, Guid revokedBy);
}

public class PatientTokenService : IPatientTokenService
{
    private readonly ApplicationDbContext _context;

    public async Task<TokenValidationResult> ValidateTokenAsync(string token)
    {
        var tokenRecord = await _context.PatientAccessTokens
            .Include(t => t.Patient)
            .FirstOrDefaultAsync(t => t.Token == token);

        if (tokenRecord == null)
        {
            return TokenValidationResult.Invalid("TOKEN_NOT_FOUND", "Token invalide");
        }

        if (tokenRecord.IsRevoked)
        {
            return TokenValidationResult.Invalid("TOKEN_REVOKED", "Token révoqué");
        }

        if (tokenRecord.ExpiresAt < DateTime.UtcNow)
        {
            return TokenValidationResult.Invalid("TOKEN_EXPIRED", "Token expiré");
        }

        if (!tokenRecord.Patient.IsActive)
        {
            return TokenValidationResult.Invalid("PATIENT_INACTIVE", "Dossier patient désactivé");
        }

        return TokenValidationResult.Valid(tokenRecord.PatientId);
    }

    public async Task<string> GenerateTokenAsync(Guid patientId, int expiresInDays = 30)
    {
        // Vérification limite tokens actifs
        var activeTokensCount = await _context.PatientAccessTokens
            .CountAsync(t => t.PatientId == patientId
                          && !t.IsRevoked
                          && t.ExpiresAt > DateTime.UtcNow);

        if (activeTokensCount >= 3)
        {
            // Révocation token le plus ancien
            var oldestToken = await _context.PatientAccessTokens
                .Where(t => t.PatientId == patientId && !t.IsRevoked)
                .OrderBy(t => t.CreatedAt)
                .FirstAsync();

            oldestToken.IsRevoked = true;
            oldestToken.RevokedAt = DateTime.UtcNow;
        }

        var token = $"pt_{DateTime.UtcNow.Year}_{Guid.NewGuid().ToString("N").Substring(0, 16)}";

        var tokenRecord = new PatientAccessToken
        {
            Id = Guid.NewGuid(),
            PatientId = patientId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(expiresInDays),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.PatientAccessTokens.Add(tokenRecord);
        await _context.SaveChangesAsync();

        return token;
    }
}
```

---

## 4. RBAC (ROLE-BASED ACCESS CONTROL)

### 4.1 Matrice permissions complète

| Ressource | ADMIN | ACCUEIL | MEDECIN | LABORANTIN | PHARMACIEN | SUPERVISEUR |
|-----------|-------|---------|---------|------------|------------|-------------|
| **Patients** |
| Créer | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Modifier | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Consulter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Supprimer | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Constantes vitales** |
| Créer | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Consulter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Consultations** |
| Créer | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Modifier | ✅ | ❌ | ✅* | ❌ | ❌ | ❌ |
| Consulter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Clôturer | ✅ | ❌ | ✅* | ❌ | ❌ | ❌ |
| **Diagnostics** |
| Créer | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Modifier | ✅ | ❌ | ✅* | ❌ | ❌ | ❌ |
| **Examens labo** |
| Prescrire | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Réaliser | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Saisir résultats | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Consulter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Prescriptions** |
| Créer | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Consulter | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Délivrer | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Médicaments** |
| Créer | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Gérer stock | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Consulter | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Utilisateurs** |
| Créer | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Modifier | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Désactiver | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Consulter | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Statistiques** |
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rapports | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Export | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Audits** |
| Sécurité | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Médical | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Légende** :
- ✅ : Autorisé
- ❌ : Interdit
- ✅* : Autorisé uniquement pour ses propres créations

---

### 4.2 Attribut autorisation ASP.NET Core

```csharp
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AuthorizeRolesAttribute : AuthorizeAttribute
{
    public AuthorizeRolesAttribute(params string[] roles)
    {
        Roles = string.Join(",", roles);
    }
}

// Constantes rôles
public static class Roles
{
    public const string ADMIN = "ADMIN";
    public const string ACCUEIL = "ACCUEIL";
    public const string MEDECIN = "MEDECIN";
    public const string LABORANTIN = "LABORANTIN";
    public const string PHARMACIEN = "PHARMACIEN";
    public const string SUPERVISEUR = "SUPERVISEUR";
}
```

---

### 4.3 Exemples utilisation contrôleurs

```csharp
[ApiController]
[Route("api/staff/patients")]
[Authorize] // Tous les rôles authentifiés
public class PatientsController : ControllerBase
{
    // Lecture : tous les rôles
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPatient(Guid id)
    {
        // Accessible à tous les rôles authentifiés
    }

    // Création : ADMIN + ACCUEIL uniquement
    [HttpPost]
    [AuthorizeRoles(Roles.ADMIN, Roles.ACCUEIL)]
    public async Task<IActionResult> CreatePatient([FromBody] CreatePatientDto dto)
    {
        // Logique création
    }

    // Suppression : ADMIN uniquement
    [HttpDelete("{id}")]
    [AuthorizeRoles(Roles.ADMIN)]
    public async Task<IActionResult> DeletePatient(Guid id)
    {
        // Logique suppression
    }
}
```

---

```csharp
[ApiController]
[Route("api/staff/consultations")]
[Authorize]
public class ConsultationsController : ControllerBase
{
    private readonly IConsultationService _consultationService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    [HttpPost]
    [AuthorizeRoles(Roles.ADMIN, Roles.MEDECIN)]
    public async Task<IActionResult> CreateConsultation([FromBody] CreateConsultationDto dto)
    {
        var userId = GetCurrentUserId();
        var result = await _consultationService.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetConsultation), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [AuthorizeRoles(Roles.ADMIN, Roles.MEDECIN)]
    public async Task<IActionResult> UpdateConsultation(Guid id, [FromBody] UpdateConsultationDto dto)
    {
        var userId = GetCurrentUserId();
        var roles = GetCurrentUserRoles();

        // Vérification ownership si pas ADMIN
        if (!roles.Contains(Roles.ADMIN))
        {
            var consultation = await _consultationService.GetByIdAsync(id);
            if (consultation.DoctorId != userId)
            {
                return Forbid(); // 403
            }
        }

        var result = await _consultationService.UpdateAsync(id, dto, userId);
        return Ok(result);
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim);
    }

    private List<string> GetCurrentUserRoles()
    {
        return User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
    }
}
```

---

### 4.4 Middleware RBAC personnalisé (optionnel)

```csharp
public class RbacMiddleware
{
    private readonly RequestDelegate _next;

    public async Task InvokeAsync(HttpContext context, IAuditService auditService)
    {
        var endpoint = context.GetEndpoint();
        var authorizeData = endpoint?.Metadata.GetMetadata<IAuthorizeData>();

        if (authorizeData != null && context.User.Identity.IsAuthenticated)
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roles = context.User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

            // Log accès pour audit
            await auditService.LogAccessAsync(new AccessLog
            {
                UserId = Guid.Parse(userId),
                Roles = roles,
                Path = context.Request.Path,
                Method = context.Request.Method,
                Timestamp = DateTime.UtcNow
            });
        }

        await _next(context);
    }
}
```

---

## 5. MIDDLEWARE ASP.NET CORE

### 5.1 Pipeline authentification

```csharp
// Program.cs ou Startup.cs

public void ConfigureServices(IServiceCollection services)
{
    // 1. Configuration JWT
    services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = Configuration["Jwt:Issuer"],
            ValidAudience = Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(Configuration["Jwt:SecretKey"])
            ),
            ClockSkew = TimeSpan.Zero // Pas de tolérance expiration
        };

        // Événements personnalisés
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                {
                    context.Response.Headers.Add("X-Token-Expired", "true");
                }
                return Task.CompletedTask;
            },
            OnTokenValidated = async context =>
            {
                // Vérification blacklist (révocation)
                var tokenService = context.HttpContext.RequestServices
                    .GetRequiredService<ITokenBlacklistService>();

                var jti = context.Principal.FindFirst("jti")?.Value;
                if (await tokenService.IsRevokedAsync(jti))
                {
                    context.Fail("Token révoqué");
                }
            }
        };
    });

    // 2. Configuration Authorization
    services.AddAuthorization();

    // 3. Services
    services.AddScoped<IAuthService, AuthService>();
    services.AddScoped<IPatientTokenService, PatientTokenService>();
    services.AddScoped<ITokenBlacklistService, TokenBlacklistService>();
    services.AddScoped<IAuditService, AuditService>();
}

public void Configure(IApplicationBuilder app)
{
    // Ordre CRITIQUE
    app.UseHttpsRedirection();
    app.UseRouting();

    app.UseCors("AllowFrontend");

    // 1. Authentification
    app.UseAuthentication();

    // 2. Middleware token patient
    app.UseMiddleware<PatientTokenMiddleware>();

    // 3. Autorisation
    app.UseAuthorization();

    // 4. RBAC audit
    app.UseMiddleware<RbacMiddleware>();

    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

---

### 5.2 Configuration appsettings.json

```json
{
  "Jwt": {
    "SecretKey": "VotreCleSecrete256BitsMinimum!123456789",
    "Issuer": "BrigadeMedicaleAPI",
    "Audience": "BrigadeMedicaleClients",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  },
  "PatientToken": {
    "DefaultExpirationDays": 30,
    "MaxActiveTokensPerPatient": 3
  },
  "RateLimiting": {
    "LoginAttempts": 5,
    "LoginWindowMinutes": 15,
    "PatientVerifyAttempts": 3,
    "PatientVerifyWindowMinutes": 5
  }
}
```

---

## 6. ANGULAR - AUTHENTIFICATION FRONTEND

### 6.1 Service authentification

```typescript
// src/app/core/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'bm_access_token';
  private readonly USER_KEY = 'bm_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(username: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    return this.http.post<{ success: boolean; data: LoginResponse }>('/api/auth/login', {
      username,
      password,
      rememberMe
    }).pipe(
      map(response => response.data),
      tap(data => {
        // Stockage access token
        localStorage.setItem(this.ACCESS_TOKEN_KEY, data.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));

        // Émission utilisateur
        this.currentUserSubject.next(data.user);

        // Planification refresh automatique
        this.scheduleTokenRefresh(data.expiresIn);
      }),
      catchError(error => {
        console.error('Login failed', error);
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<string> {
    return this.http.post<{ success: boolean; data: { accessToken: string } }>(
      '/api/auth/refresh',
      {},
      { withCredentials: true } // Envoie cookie refreshToken
    ).pipe(
      map(response => response.data.accessToken),
      tap(accessToken => {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      }),
      catchError(error => {
        // Refresh échoué → déconnexion
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post('/api/auth/logout', {}, { withCredentials: true }).pipe(
      tap(() => {
        this.clearSession();
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        // Même si erreur serveur, on déconnecte localement
        this.clearSession();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return roles.some(role => user?.roles.includes(role));
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null && this.getCurrentUser() !== null;
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  private clearSession(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  private scheduleTokenRefresh(expiresInSeconds: number): void {
    // Refresh 1 minute avant expiration
    const refreshTime = (expiresInSeconds - 60) * 1000;

    setTimeout(() => {
      this.refreshToken().subscribe({
        next: () => console.log('Token refreshed automatically'),
        error: (err) => console.error('Auto-refresh failed', err)
      });
    }, refreshTime);
  }
}
```

---

### 6.2 Intercepteur JWT

```typescript
// src/app/core/interceptors/jwt.interceptor.ts

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ajout token si disponible
    const token = this.authService.getAccessToken();

    if (token) {
      req = this.addToken(req, token);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/auth/login')) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((newToken: string) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(newToken);
          return next.handle(this.addToken(req, newToken));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      // Attente refresh en cours
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addToken(req, token!)))
      );
    }
  }
}
```

---

### 6.3 Guard authentification

```typescript
// src/app/core/guards/auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Redirection login avec URL de retour
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
```

---

### 6.4 Guard rôles

```typescript
// src/app/core/guards/role.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (this.authService.hasAnyRole(requiredRoles)) {
      return true;
    }

    // Accès refusé
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
```

---

### 6.5 Configuration routes Angular

```typescript
// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  // Routes publiques
  {
    path: '',
    loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // Routes staff (authentifiées)
  {
    path: 'staff',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/staff/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'accueil',
        loadChildren: () => import('./features/staff/accueil/accueil.module').then(m => m.AccueilModule),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'ACCUEIL'] }
      },
      {
        path: 'consultations',
        loadChildren: () => import('./features/staff/consultation/consultation.module').then(m => m.ConsultationModule),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'MEDECIN'] }
      },
      {
        path: 'laboratory',
        loadChildren: () => import('./features/staff/laboratory/laboratory.module').then(m => m.LaboratoryModule),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'LABORANTIN'] }
      },
      {
        path: 'pharmacy',
        loadChildren: () => import('./features/staff/pharmacy/pharmacy.module').then(m => m.PharmacyModule),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'PHARMACIEN'] }
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/staff/admin/admin.module').then(m => m.AdminModule),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  },

  // 404
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

---

### 6.6 Directive masquage UI par rôle

```typescript
// src/app/shared/directives/has-role.directive.ts

import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {
  @Input() appHasRole: string[] = [];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.updateView();

    // Réactivité si user change
    this.authService.currentUser$.subscribe(() => {
      this.updateView();
    });
  }

  private updateView(): void {
    if (this.authService.hasAnyRole(this.appHasRole)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
```

**Usage** :
```html
<button *appHasRole="['ADMIN', 'ACCUEIL']" (click)="createPatient()">
  Nouveau patient
</button>

<div *appHasRole="['PHARMACIEN']">
  <!-- Contenu réservé pharmacien -->
</div>
```

---

## 7. CLÔTURE PARCOURS PATIENT (NOUVEAU)

### 7.1 Endpoint clôture visite

#### `POST /api/staff/patients/{id}/close-visit`

**Description** : Clôture complète du parcours patient (consultation → labo → pharmacie)

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ADMIN, MEDECIN, ACCUEIL

**Request Body** :
```json
{
  "notes": "Patient en bonne voie de guérison. RDV de contrôle dans 7 jours si symptômes persistent.",
  "sendSummary": true,
  "summaryDeliveryMethod": "SMS"
}
```

**Response 200** :
```json
{
  "success": true,
  "data": {
    "patientId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "patientNumber": "BM-2026-00042",
    "visitClosed": true,
    "closedAt": "2026-01-24T15:30:00Z",
    "summary": {
      "consultationsCount": 1,
      "labTestsCount": 1,
      "prescriptionsCount": 1,
      "medicationsDispensed": 2
    },
    "summaryDelivered": true,
    "deliveryMethod": "SMS"
  }
}
```

**Logique métier** :
1. Vérification toutes consultations clôturées
2. Vérification tous examens complétés
3. Vérification toutes ordonnances délivrées
4. Génération résumé PDF (optionnel)
5. Envoi SMS/Email avec résumé (si demandé)
6. Log audit médical

---

### 7.2 Service clôture

```csharp
public interface IPatientVisitService
{
    Task<VisitClosureResult> CloseVisitAsync(Guid patientId, CloseVisitDto dto, Guid closedBy);
}

public class PatientVisitService : IPatientVisitService
{
    private readonly ApplicationDbContext _context;
    private readonly IAuditService _auditService;
    private readonly INotificationService _notificationService;

    public async Task<VisitClosureResult> CloseVisitAsync(Guid patientId, CloseVisitDto dto, Guid closedBy)
    {
        var patient = await _context.Patients
            .Include(p => p.Consultations)
            .Include(p => p.LabTests)
            .Include(p => p.Prescriptions)
            .FirstOrDefaultAsync(p => p.Id == patientId);

        if (patient == null)
            throw new NotFoundException("Patient introuvable");

        // Vérifications
        var todayConsultations = patient.Consultations
            .Where(c => c.ConsultationDate.Date == DateTime.UtcNow.Date)
            .ToList();

        var pendingConsultations = todayConsultations.Where(c => c.Status != "COMPLETED").ToList();
        if (pendingConsultations.Any())
            throw new BusinessException("Des consultations sont encore en cours");

        var pendingLabTests = patient.LabTests
            .Where(l => l.Status != "COMPLETED" && l.Status != "CANCELLED")
            .ToList();
        if (pendingLabTests.Any())
            throw new BusinessException("Des examens de laboratoire sont en attente");

        var pendingPrescriptions = patient.Prescriptions
            .Where(p => p.Status != "DISPENSED" && p.Status != "CANCELLED")
            .ToList();
        if (pendingPrescriptions.Any())
            throw new BusinessException("Des ordonnances n'ont pas été délivrées");

        // Génération résumé
        var summary = GenerateSummary(patient, todayConsultations);

        // Envoi notification si demandé
        if (dto.SendSummary)
        {
            await _notificationService.SendVisitSummaryAsync(patient, summary, dto.SummaryDeliveryMethod);
        }

        // Audit
        await _auditService.LogMedicalActionAsync(new MedicalAuditLog
        {
            EntityType = "PATIENT_VISIT",
            EntityId = patientId,
            Action = "CLOSE",
            PatientId = patientId,
            PerformedBy = closedBy,
            Timestamp = DateTime.UtcNow,
            NewValues = JsonSerializer.Serialize(new { notes = dto.Notes, summary })
        });

        return new VisitClosureResult
        {
            PatientId = patientId,
            PatientNumber = patient.PatientNumber,
            VisitClosed = true,
            ClosedAt = DateTime.UtcNow,
            Summary = summary,
            SummaryDelivered = dto.SendSummary,
            DeliveryMethod = dto.SummaryDeliveryMethod
        };
    }
}
```

---

## 8. SÉCURITÉ AVANCÉE

### 8.1 Protection CSRF (Cross-Site Request Forgery)

**Refresh token** : Cookie SameSite=Strict + HttpOnly

```csharp
response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
{
    HttpOnly = true,
    Secure = true, // HTTPS uniquement
    SameSite = SameSiteMode.Strict,
    Path = "/api/auth/refresh",
    MaxAge = TimeSpan.FromDays(7)
});
```

---

### 8.2 Rate Limiting (anti-bruteforce)

```csharp
// Middleware rate limiting (exemple avec AspNetCoreRateLimit)

public void ConfigureServices(IServiceCollection services)
{
    services.Configure<IpRateLimitOptions>(Configuration.GetSection("IpRateLimiting"));
    services.AddInMemoryRateLimiting();
    services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
}

// appsettings.json
{
  "IpRateLimiting": {
    "EnableEndpointRateLimiting": true,
    "StackBlockedRequests": false,
    "RealIpHeader": "X-Real-IP",
    "ClientIdHeader": "X-ClientId",
    "GeneralRules": [
      {
        "Endpoint": "POST:/api/auth/login",
        "Period": "15m",
        "Limit": 5
      },
      {
        "Endpoint": "POST:/api/auth/patient/verify",
        "Period": "5m",
        "Limit": 3
      }
    ]
  }
}
```

---

### 8.3 Validation inputs (DTO)

```csharp
public class LoginDto
{
    [Required(ErrorMessage = "Le nom d'utilisateur est requis")]
    [StringLength(50, MinimumLength = 3)]
    public string Username { get; set; }

    [Required(ErrorMessage = "Le mot de passe est requis")]
    [StringLength(100, MinimumLength = 8)]
    public string Password { get; set; }

    public bool RememberMe { get; set; }
}

// Contrôleur
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginDto dto)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(new
        {
            success = false,
            error = new
            {
                code = "VALIDATION_ERROR",
                message = "Données invalides",
                details = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
            }
        });
    }

    // Logique authentification
}
```

---

## 9. TESTS UNITAIRES

### 9.1 Test service authentification

```csharp
[TestClass]
public class AuthServiceTests
{
    private Mock<ApplicationDbContext> _contextMock;
    private Mock<ITokenService> _tokenServiceMock;
    private AuthService _authService;

    [TestInitialize]
    public void Setup()
    {
        _contextMock = new Mock<ApplicationDbContext>();
        _tokenServiceMock = new Mock<ITokenService>();
        _authService = new AuthService(_contextMock.Object, _tokenServiceMock.Object);
    }

    [TestMethod]
    public async Task Login_ValidCredentials_ReturnsTokens()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = "test.user",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            IsActive = true
        };

        _contextMock.Setup(c => c.Users.FindAsync(It.IsAny<Guid>()))
            .ReturnsAsync(user);

        _tokenServiceMock.Setup(t => t.GenerateAccessToken(user))
            .Returns("access_token");

        _tokenServiceMock.Setup(t => t.GenerateRefreshToken(user))
            .Returns("refresh_token");

        // Act
        var result = await _authService.LoginAsync("test.user", "password123", false);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual("access_token", result.AccessToken);
        Assert.IsNotNull(result.User);
    }

    [TestMethod]
    [ExpectedException(typeof(UnauthorizedException))]
    public async Task Login_InvalidPassword_ThrowsException()
    {
        // Arrange
        var user = new User
        {
            Username = "test.user",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct_password")
        };

        _contextMock.Setup(c => c.Users.FirstOrDefaultAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(user);

        // Act
        await _authService.LoginAsync("test.user", "wrong_password", false);

        // Assert - Exception attendue
    }
}
```

---

## ✅ CHECKLIST DE VALIDATION

- [x] JWT dual token (access + refresh)
- [x] Refresh token HttpOnly Cookie
- [x] Token patient avec header X-Patient-Token
- [x] RBAC complet (6 rôles, matrice permissions)
- [x] Middleware authentification ASP.NET Core
- [x] Guards Angular (auth + rôle)
- [x] Intercepteur JWT avec refresh automatique
- [x] Directive masquage UI par rôle
- [x] Endpoint clôture parcours patient
- [x] Blacklist tokens révoqués
- [x] Rate limiting anti-bruteforce
- [x] Protection CSRF
- [x] Validation inputs (DTO)
- [x] Audit sécurité + médical
- [x] Tests unitaires

---

## 📋 PROCHAINE ÉTAPE

**LIVRABLE 5** : Développement Backend ASP.NET Core (structure projet, services, repositories, controllers)

---

**⏸️ EN ATTENTE DE VALIDATION CLIENT**

_Merci de valider ce système d'authentification avant de poursuivre._
