using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Auth.Commands.Login;

namespace TuneVault.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[AllowAnonymous] // Login endpoint is public
public class AuthController(IMediator mediator) : ControllerBase
{

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var response = await mediator.Send(command);
        return Ok(new { success = true, data = response });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] TuneVault.Application.Features.Auth.Commands.Register.RegisterCommand command)
    {
        var response = await mediator.Send(command);
        return Ok(new { success = true, data = response });
    }
}
