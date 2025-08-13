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
using Quiz.Application.Feature.Token.Commands;                     // CreateTokenCommand (+ validator)
using QuizHub.Application.Feature.User.Commands;                  // RegisterUserCommand (+ validator)
using Quiz.Application.Feature.Admin.Quizzes.Commands.CreateQuiz; // CreateQuizCommandValidator
using Quiz.Application.Security;

using Quiz.Infrastructure.Data;

// Repozitorijumi (u tvom kodu postoje i Quiz.* i QuizHub.* prostori imena)
using Quiz.Infrastructure.Repository;
using QuizHub.Infrastructure.Repository;

// Kontrakti
using Quiz.Domain.Contracts;
using QuizHub.Domain.Contracts;

using Quiz.Infrastructure.Security;

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
// CORS (dev-friendly)
// =======================
const string FrontendDevPolicy = "FrontendDev";

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendDevPolicy, policy =>
    {
        // dozvoli React dev server
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
        // Ako koristiš cookie auth, dodaj .AllowCredentials() i izbaci AllowAnyOrigin
    });
});

// =======================
// Repositories (DI)
// =======================
// Zadrži samo one koji postoje u tvom solutionu (ako neki tip ne postoji, ukloni tu liniju).
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IQuizRepository, QuizRepository>();
builder.Services.AddScoped<IQuizAdminRepository, QuizAdminRepository>();
builder.Services.AddScoped<IResultsRepository, ResultsRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();

// =======================
// MediatR & FluentValidation
// =======================
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblyContaining<RegisterUserCommandHandler>());

builder.Services.AddValidatorsFromAssembly(typeof(RegisterUserCommandValidator).Assembly);
builder.Services.AddValidatorsFromAssemblyContaining<CreateQuizCommandValidator>();

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

        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.Name
    };
});

builder.Services.AddAuthorization(o =>
{
    o.AddPolicy("Admin", p => p.RequireRole("Admin"));
});

// Token service
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();

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

// VAŽNO: CORS prije auth-a
app.UseCors(FrontendDevPolicy);

// HTTPS redirekcija SAMO van develop okruženja (ovo često izazove "Network Error" kad front gađa http)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
