# LIVRABLE 5 - SUITE : CONTROLLERS, MIDDLEWARE & CONFIGURATION

**Cette suite complète le LIVRABLE_05_BACKEND_ASPNET_CORE.md**

---

## 6. COUCHE API (Controllers)

### 6.1 PatientsController

```csharp
// BrigadeMedicale.API/Controllers/PatientsController.cs

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BrigadeMedicale.Application.Interfaces;
using BrigadeMedicale.Application.DTOs.Patient;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.API.Controllers;

[Route("api/staff/patients")]
[Authorize]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patientService;

    public PatientsController(IPatientService patientService)
    {
        _patientService = patientService;
    }

    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _patientService.SearchPatientsAsync(search, page, pageSize);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _patientService.GetByIdAsync(id);
        return Ok(new { success = true, data = result });
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN,ACCUEIL")]
    public async Task<IActionResult> Create([FromBody] CreatePatientDto dto)
    {
        var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? Guid.Empty.ToString());
        var result = await _patientService.CreatePatientAsync(dto, userId, "ACCUEIL");

        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            new { success = true, data = result, message = "Patient créé avec succès" });
    }
}
```

---

## 7. MIDDLEWARE

### 7.1 ExceptionHandlingMiddleware

```csharp
// BrigadeMedicale.API/Middleware/ExceptionHandlingMiddleware.cs

using System.Net;
using System.Text.Json;
using BrigadeMedicale.Domain.Exceptions;

namespace BrigadeMedicale.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, code, message, details) = exception switch
        {
            NotFoundException notFoundEx =>
                (HttpStatusCode.NotFound, notFoundEx.Code, notFoundEx.Message, (object?)null),

            DuplicateException duplicateEx =>
                (HttpStatusCode.Conflict, duplicateEx.Code, duplicateEx.Message, duplicateEx.DuplicateData),

            UnauthorizedException unauthorizedEx =>
                (HttpStatusCode.Unauthorized, unauthorizedEx.Code, unauthorizedEx.Message, (object?)null),

            BusinessException businessEx =>
                (HttpStatusCode.UnprocessableEntity, businessEx.Code, businessEx.Message, (object?)null),

            _ =>
                (HttpStatusCode.InternalServerError, "INTERNAL_ERROR", "Une erreur interne est survenue", (object?)null)
        };

        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Erreur interne non gérée");
        }

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            success = false,
            error = new
            {
                code = code,
                message = message,
                details = details
            }
        };

        var json = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(json);
    }
}
```

---

## 8. CONFIGURATION PROGRAM.CS

```csharp
// BrigadeMedicale.API/Program.cs

using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BrigadeMedicale.Infrastructure.Data;
using BrigadeMedicale.Application.Interfaces;
using BrigadeMedicale.Application.Services;
using BrigadeMedicale.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Authentication JWT
var jwtSettings = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!)),
            ClockSkew = TimeSpan.Zero
        };
    });

// Services
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPatientService, PatientService>();
// ... autres services

// AutoMapper
builder.Services.AddAutoMapper(typeof(Application.Mappings.AutoMapperProfile));

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

## 9. APPSETTINGS.JSON

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=BrigadeMedicale;Username=postgres;Password=password"
  },
  "Jwt": {
    "SecretKey": "VotreCleSecrete256BitsMinimum!12345678901234567890",
    "Issuer": "BrigadeMedicaleAPI",
    "Audience": "BrigadeMedicaleClients",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  }
}
```

---

## 10. COMMANDES DOTNET

```bash
# Créer solution
dotnet new sln -n BrigadeMedicale

# Créer projets
dotnet new classlib -n BrigadeMedicale.Domain
dotnet new classlib -n BrigadeMedicale.Application
dotnet new classlib -n BrigadeMedicale.Infrastructure
dotnet new webapi -n BrigadeMedicale.API

# Packages NuGet
cd BrigadeMedicale.Infrastructure
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package BCrypt.Net-Next

cd ../BrigadeMedicale.API
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer

# Migrations
dotnet ef migrations add InitialCreate --project BrigadeMedicale.Infrastructure
dotnet ef database update --project BrigadeMedicale.Infrastructure
```

---

## ✅ VALIDATION

Ce livrable couvre :
- ✅ Structure complète solution ASP.NET Core
- ✅ Couche Domain (Entities, Enums, Exceptions)
- ✅ Couche Infrastructure (DbContext, Repositories, UnitOfWork)
- ✅ Couche Application (Services, DTOs, Mappings)
- ✅ Couche API (Controllers, Middleware)
- ✅ Configuration JWT + EF Core
- ✅ Commandes setup projet

**PROCHAINE ÉTAPE** : LIVRABLE 6 - Frontend Angular
