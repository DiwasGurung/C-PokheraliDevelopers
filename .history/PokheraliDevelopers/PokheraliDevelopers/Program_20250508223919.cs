using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using PokheraliDevelopers.Data;
using PokheraliDevelopers.Models;
using PokheraliDevelopers.Service;
using System.Text;
using System.Security.Claims;
using Microsoft.AspNetCore.Cors.Infrastructure;
using PokheraliDevelopers.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DB context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreConn")));

// Add Identity with custom settings
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password requirements
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;

    // User requirements
    options.User.RequireUniqueEmail = true;

    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure Identity cookie settings
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.None; // For cross-origin requests
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // For HTTPS
    options.ExpireTimeSpan = TimeSpan.FromHours(2);
    options.SlidingExpiration = true;
});

// Add Scoped services
builder.Services.AddScoped<CartService, CartService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();

// Add SignalR for real-time notifications
builder.Services.AddSignalR();

// Configure CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // Adjust to your frontend URL
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
});

// Add JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "Identity.Application";
    options.DefaultSignInScheme = "Identity.External";
    options.DefaultAuthenticateScheme = "Identity.Application";
    options.DefaultChallengeScheme = "Identity.Application";
});

// Configure static files
builder.Services.AddStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
    RequestPath = "/uploads"
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowFrontend");

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<OrderHub>("/hubs/orders");

// Initialize roles and admin user
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    // Ensure database is created
    dbContext.Database.EnsureCreated();

    // Create roles if they don't exist
    string[] roles = { "Admin", "Staff", "Member" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    // Create an admin user if it doesn't exist
    var adminEmail = builder.Configuration["AdminCredentials:Email"];
    var adminPassword = builder.Configuration["AdminCredentials:Password"];

    if (!string.IsNullOrEmpty(adminEmail) && !string.IsNullOrEmpty(adminPassword))
    {
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new IdentityUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(adminUser, adminPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");

                // Create admin profile
                var userProfile = new UserProfile
                {
                    UserId = adminUser.Id,
                    FirstName = "Admin",
                    LastName = "User",
                    CreatedAt = DateTime.UtcNow
                };

                dbContext.UserProfiles.Add(userProfile);
                await dbContext.SaveChangesAsync();
            }
        }
    }
}

app.Run();
