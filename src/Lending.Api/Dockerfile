# Stage 1: Build and Restore
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY ["Lending.Api.csproj", "."]
RUN dotnet restore "Lending.Api.csproj"

# Copy everything from current folder into /src
COPY . .

# Install EF Core CLI
RUN dotnet tool install --global dotnet-ef
ENV PATH="$PATH:/root/.dotnet/tools"

RUN dotnet build "Lending.Api.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "Lending.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Run EF migrations automatically, then start the app
ENTRYPOINT ["dotnet", "Lending.Api.dll"]
