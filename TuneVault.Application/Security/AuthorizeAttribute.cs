namespace TuneVault.Application.Security;

[AttributeUsage(AttributeTargets.Class, AllowMultiple = true, Inherited = true)]
public class AuthorizeAttribute : Attribute
{
    
    public string Roles { get; set; } = string.Empty;
    
    
    public string Policies { get; set; } = string.Empty;
}
