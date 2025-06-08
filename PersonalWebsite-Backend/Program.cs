using dotenv.net;

var builder = WebApplication.CreateBuilder(args);

DotEnv.Load();
var token = Environment.GetEnvironmentVariable("ACCESS_TOKEN");

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

// Register HttpClient for GithubService with configurations
builder.Services.AddHttpClient<PersonalWebsite_Backend.Services.GithubService>(client =>
{
    client.BaseAddress = new Uri("https://api.github.com/");
    // GitHub API requires a User-Agent header
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

// Configure the HTTP request pipeline.
/*
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
*/

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();