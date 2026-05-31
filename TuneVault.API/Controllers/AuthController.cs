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
        return Ok(response);
    }
}
