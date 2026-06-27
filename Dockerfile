# Use the official .NET SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["TuneVault.API/TuneVault.API.csproj", "TuneVault.API/"]
COPY ["TuneVault.Application/TuneVault.Application.csproj", "TuneVault.Application/"]
COPY ["TuneVault.Domain/TuneVault.Domain.csproj", "TuneVault.Domain/"]
COPY ["TuneVault.Infrastructure/TuneVault.Infrastructure.csproj", "TuneVault.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "TuneVault.API/TuneVault.API.csproj"

# Copy the rest of the code
COPY . .
WORKDIR "/src/TuneVault.API"

# Build the app
RUN dotnet build "TuneVault.API.csproj" -c Release -o /app/build

# Publish the app
FROM build AS publish
RUN dotnet publish "TuneVault.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build the final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .


# Expose port 8080 depending on the .NET version configuration
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "TuneVault.API.dll"]
