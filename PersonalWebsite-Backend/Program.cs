using dotenv.net;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

DotEnv.Load();
var token = Environment.GetEnvironmentVariable("ACCESS_TOKEN");

// Add services to the container.
builder.Services.AddControllers();

// Register HttpClient for GithubService with configurations
builder.Services.AddHttpClient<PersonalWebsite_Backend.Services.GithubService>(client =>
{
    client.BaseAddress = new Uri("https://api.github.com/");
    client.DefaultRequestHeaders.UserAgent.ParseAdd("PersonalWebsite-Backend/1.0");
});

// Register HttpClient for SpotifyService with configurations
builder.Services.AddHttpClient<PersonalWebsite_Backend.Services.SpotifyService>(client =>
{
    client.BaseAddress = new Uri("https://api.spotify.com/v1/");
    client.DefaultRequestHeaders.Authorization = 
        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("PersonalWebsite-Backend/1.0");
});

var app = builder.Build();

// FRONTEND
// Serve default files like index.html
app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "frontend"))
});

// Serve static files (JS, CSS, etc.)
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "frontend")),
    RequestPath = ""
});


app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();