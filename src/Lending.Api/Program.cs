using Lending.Api.BackgroundServices;
using Lending.Api.Data;
using Lending.Api.Services;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(opt =>
opt.UseSqlite("Data Source=/app/data/lending/lending.db"));

builder.Services.AddScoped<LoanService>();

builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect("redis:6379"));

builder.Services.AddHostedService<OverdueCheckerService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();  
    await db.Database.MigrateAsync(); 

    await SeedData.InitializeAsync(db);
}


app.UseCors("AllowReactApp");
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();
app.Run();
