using System.Text.Json;
using FluentValidation; // hvatanje FluentValidation.ValidationException za svaki slučaj
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Quiz.Application.Exceptions;

namespace Quiz.Api.Middlewear
{
    /// <summary>
    /// Globalni exception handler koji vraća 400 za validacione greške, a 500 za ostalo.
    /// </summary>
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext ctx)
        {
            try
            {
                await _next(ctx);
            }
            catch (Quiz.Application.Exceptions.ValidationException vex) // NAŠA custom
            {
                ctx.Response.StatusCode = StatusCodes.Status400BadRequest;
                ctx.Response.ContentType = "application/json";
                var payload = new { title = "One or more validation errors occurred.", status = 400, errors = vex.Errors };
                await ctx.Response.WriteAsync(JsonSerializer.Serialize(payload));
            }
            catch (FluentValidation.ValidationException fex) // Ako negde procuri FluentValidation-ova
            {
                ctx.Response.StatusCode = StatusCodes.Status400BadRequest;
                ctx.Response.ContentType = "application/json";

                var errors = fex.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).Distinct().ToArray());

                var payload = new { title = "One or more validation errors occurred.", status = 400, errors };
                await ctx.Response.WriteAsync(JsonSerializer.Serialize(payload));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception");
                ctx.Response.StatusCode = StatusCodes.Status500InternalServerError;
                ctx.Response.ContentType = "application/json";
                await ctx.Response.WriteAsync(JsonSerializer.Serialize(new { title = "Internal Server Error", status = 500 }));
            }
        }
    }
}
