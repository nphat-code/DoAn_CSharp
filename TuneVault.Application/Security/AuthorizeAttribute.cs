namespace TuneVault.Application.Security;

[AttributeUsage(AttributeTargets.Class, AllowMultiple = true, Inherited = true)]
public class AuthorizeAttribute : Attribute
{
    // Dùng để phân quyền theo Roles (ví dụ: "Admin,User")
    public string Roles { get; set; } = string.Empty;
    
    // Dùng để phân quyền theo Policies (ví dụ: "CanEditPlaylist")
    public string Policies { get; set; } = string.Empty;
}
