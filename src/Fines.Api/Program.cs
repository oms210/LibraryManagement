using Fines.Api.BackgroundServices;
using Fines.Api.Data;
using Fines.Api.Services;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();

builder.Services.AddDbContext<FinesDbContext>(opt =>
opt.UseSqlite("Data Source=/app/data/fines/fines.db"));

//var dataDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "data", "fines"));
//Directory.CreateDirectory(dataDir);
//var dbPath = Path.Combine(dataDir, "fines.db");
//var connString = $"Data Source={dbPath}";
//builder.Services.AddDbContext<FinesDbContext>(opt =>
//    opt.UseSqlite(connString));

builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect("redis:6379"));
builder.Services.AddSingleton<NotificationService>();
builder.Services.AddHostedService<FineSubscriberService>();
builder.Services.AddHostedService<FineNotifierService>();
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
    var db = scope.ServiceProvider.GetRequiredService<FinesDbContext>();
    db.Database.Migrate();
}


app.UseCors("AllowReactApp");
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();
app.Run();
