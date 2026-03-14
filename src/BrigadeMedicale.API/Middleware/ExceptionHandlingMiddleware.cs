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
