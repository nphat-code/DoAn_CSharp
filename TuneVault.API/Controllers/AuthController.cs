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

    [HttpGet("check-email")]
    public async Task<IActionResult> CheckEmail([FromQuery] string email)
    {
        var exists = await mediator.Send(new TuneVault.Application.Features.Auth.Queries.CheckEmail.CheckEmailQuery(email));
        return Ok(new { success = true, exists = exists });
    }

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] TuneVault.Application.Features.Auth.Commands.SendOtp.SendOtpCommand command)
    {
        var result = await mediator.Send(command);
        return Ok(new { success = true });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] TuneVault.Application.Features.Auth.Commands.VerifyOtp.VerifyOtpCommand command)
    {
        var response = await mediator.Send(command);
        return Ok(new { success = true, data = response });
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] TuneVault.Application.Features.Auth.Commands.GoogleLogin.GoogleLoginCommand command)
    {
        var response = await mediator.Send(command);
        return Ok(new { success = true, data = response });
    }
}
