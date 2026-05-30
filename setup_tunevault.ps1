# Bật stop on error
$ErrorActionPreference = "Stop"

$solutionName = "TuneVault"

Write-Host "Khởi tạo solution $solutionName..."
dotnet new sln -n $solutionName

Write-Host "Khởi tạo các project..."
# 1. Domain Project
dotnet new classlib -n "$solutionName.Domain" -f net10.0
# 2. Application Project
dotnet new classlib -n "$solutionName.Application" -f net10.0
# 3. Infrastructure Project
dotnet new classlib -n "$solutionName.Infrastructure" -f net10.0
# 4. API Project
dotnet new webapi -n "$solutionName.API" -f net10.0

Write-Host "Thêm các project vào solution..."
dotnet sln add "$solutionName.Domain/$solutionName.Domain.csproj"
dotnet sln add "$solutionName.Application/$solutionName.Application.csproj"
dotnet sln add "$solutionName.Infrastructure/$solutionName.Infrastructure.csproj"
dotnet sln add "$solutionName.API/$solutionName.API.csproj"

Write-Host "Thiết lập Project References theo Clean Architecture..."
# Application phụ thuộc vào Domain
dotnet add "$solutionName.Application/$solutionName.Application.csproj" reference "$solutionName.Domain/$solutionName.Domain.csproj"

# Infrastructure phụ thuộc vào Application (và gián tiếp là Domain)
dotnet add "$solutionName.Infrastructure/$solutionName.Infrastructure.csproj" reference "$solutionName.Application/$solutionName.Application.csproj"

# API phụ thuộc vào Application và Infrastructure
dotnet add "$solutionName.API/$solutionName.API.csproj" reference "$solutionName.Application/$solutionName.Application.csproj"
dotnet add "$solutionName.API/$solutionName.API.csproj" reference "$solutionName.Infrastructure/$solutionName.Infrastructure.csproj"

Write-Host "Cài đặt các NuGet packages cần thiết..."
# Cài đặt MediatR cho Application
dotnet add "$solutionName.Application/$solutionName.Application.csproj" package MediatR

# Cài đặt Entity Framework Core cho Infrastructure
dotnet add "$solutionName.Infrastructure/$solutionName.Infrastructure.csproj" package Microsoft.EntityFrameworkCore
dotnet add "$solutionName.Infrastructure/$solutionName.Infrastructure.csproj" package Microsoft.EntityFrameworkCore.SqlServer
dotnet add "$solutionName.Infrastructure/$solutionName.Infrastructure.csproj" package Microsoft.EntityFrameworkCore.Design

# Cài đặt EF Core Design cho API (cần thiết để chạy các lệnh migration từ API project)
dotnet add "$solutionName.API/$solutionName.API.csproj" package Microsoft.EntityFrameworkCore.Design

Write-Host "Hoàn tất khởi tạo Clean Architecture cho $solutionName!"
