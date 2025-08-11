using System.Security.Claims;
using System.Text;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

using Quiz.Api.Middlewear;
using Quiz.Application.Behaviours;
using Quiz.Application.Feature.Token.Commands;                 // CreateTokenCommand (+ validator)
using Quiz.Application.Feature.Quizzes.Queries.GetQuizzes;    // (anchor za MediatR)
using Quiz.Application.Security;
using QuizHub.Application.Feature.User.Commands;              // RegisterUserCommand (+ validator)

using Quiz.Infrastructure.Data;
using Quiz.Infrastructure.Repository;
using Quiz.Infrastructure.Security;

using QuizHub.Domain.Contracts;
using QuizHub.Infrastructure.Repository;
using Quiz.Domain.Contracts;                                // IUserRepository, IQuizRepository, IQuizAdminRepository, IResultsRepository, ICategoryRepository

var builder = WebApplication.CreateBuilder(args);

// =======================
// DbContext
// =======================
builder.Services.AddDbContext<QuizDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// =======================
// Controllers
// =======================
builder.Services.AddControllers();

// =======================
// Swagger + Bearer auth
// =======================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "QuizHub API", Version = "v1" });

    var jwtScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your token}",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    c.AddSecurityDefinition("Bearer", jwtScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtScheme, Array.Empty<string>() }
    });
});

// =======================
// Repositories (DI)
// =======================
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IQuizRepository, QuizRepository>();
builder.Services.AddScoped<IQuizAdminRepository, QuizAdminRepository>();
builder.Services.AddScoped<IResultsRepository, ResultsRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>(); // ako imaš Category repo

// =======================
// MediatR & FluentValidation
// =======================
// Dovoljno je da skenira ceo Application assembly koristeći jedan anchor tip:
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblyContaining<RegisterUserCommandHandler>());

// Pokupi sve validatore iz Application assembly-ja:
builder.Services.AddValidatorsFromAssembly(typeof(RegisterUserCommandValidator).Assembly);

// Globalna validation pipeline
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));

// =======================
// Auth (JWT) + Admin policy
// =======================
var jwt = builder.Configuration.GetSection("Jwt");
var key = jwt["Key"] ?? throw new InvalidOperationException("Jwt:Key missing");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(opt =>
{
    opt.RequireHttpsMetadata = false; // u produkciji -> true i HTTPS
    opt.SaveToken = true;
    opt.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),

        ValidateIssuer = true,
        ValidIssuer = jwt["Issuer"],

        ValidateAudience = true,
        ValidAudience = jwt["Audience"],

        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromSeconds(30),

        // bitno za role i name iz tokena
        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.Name
    };
});

builder.Services.AddAuthorization(o =>
{
    // koristi se na admin kontrolerima: [Authorize(Policy = "Admin")]
    o.AddPolicy("Admin", p => p.RequireRole("Admin"));
});

// Token service
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();

// =======================
// CORS (dev-friendly)
// =======================
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// =======================
// Middleware pipeline
// =======================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// globalni exception handler
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
