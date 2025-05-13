using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;
using PokheraliDevelopers.Models;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
    }

    [Authorize(Roles = "Admin, Staff, Member")]
    [HttpGet("users")]
    public IActionResult GetAllUsers()
    {
        var users = _userManager.Users.Select(u => new { u.Id, u.Email });
        return Ok(users);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Create the user with email and password
        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            FirstName = model.FirstName,
            LastName = model.LastName,
            Address = model.Address,
            City = model.City,
            State = model.State,
            ZipCode = model.ZipCode,
            PhoneNumber = model.PhoneNumber
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
        {
            // Add user to Member role if it exists
            if (await _roleManager.RoleExistsAsync("Member"))
            {
                await _userManager.AddToRoleAsync(user, "Member");
            }

            // Auto sign in the user after registration
            await _signInManager.SignInAsync(user, isPersistent: false);

            return Ok(new
            {
                Message = "User registered successfully.",
                UserId = user.Id,
                Email = user.Email
            });
        }

        return BadRequest(result.Errors);
    }

    [HttpPost("register-something")]
    public async Task<IActionResult> RegisterAsSomething([FromBody] RegisterDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            FirstName = model.FirstName,
            LastName = model.LastName,
            Address = model.Address,
            City = model.City,
            State = model.State,
            ZipCode = model.ZipCode,
            PhoneNumber = model.PhoneNumber
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
        {
            // Ensure the "something" role exists
            if (!await _roleManager.RoleExistsAsync("something"))
            {
                await _roleManager.CreateAsync(new IdentityRole("something"));
            }

            await _userManager.AddToRoleAsync(user, "something");

            // Auto sign in the user
            await _signInManager.SignInAsync(user, isPersistent: false);

            return Ok(new
            {
                Message = "User registered successfully as 'something'.",
                UserId = user.Id,
                Email = user.Email
            });
        }

        return BadRequest(result.Errors);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] CredentialDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // This will sign in the user and create the authentication cookie
        var result = await _signInManager.PasswordSignInAsync(
            model.Email,
            model.Password,
            isPersistent: true,  // Set to true for a persistent cookie
            lockoutOnFailure: false);

        if (result.Succeeded)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            var roles = await _userManager.GetRolesAsync(user);

            // Creating a response with basic user info
            var userInfo = new
            {
                Id = user.Id,
                Email = user.Email,
                Roles = roles,
                FirstName = user.FirstName,
                LastName = user.LastName
            };

            return Ok(new
            {
                Message = "Logged in successfully.",
                User = userInfo
            });
        }

        if (result.IsLockedOut)
        {
            return BadRequest("Account is locked out. Please try again later.");
        }

        return BadRequest("Invalid login attempt.");
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok("Logged out successfully.");
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetUserProfile()
    {
        var user = await _userManager.GetUserAsync(User);

        if (user == null)
        {
            return NotFound("User not found.");
        }

        var roles = await _userManager.GetRolesAsync(user);

        var profile = new
        {
            Id = user.Id,
            Email = user.Email,
            Roles = roles,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Address = user.Address,
            City = user.City,
            State = user.State,
            ZipCode = user.ZipCode
        };

        return Ok(profile);
    }
}
