using System.Net;
using System.Text.Json;

namespace PersonalWebsite.Services;

public class SpotifyService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SpotifyService> _logger;

    public SpotifyService(HttpClient httpClient, ILogger<SpotifyService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        
        // Set in Program.cs, double check
        if (_httpClient.BaseAddress == null)
        {
            _httpClient.BaseAddress = new Uri("https://api.spotify.com/v1/");
        }
        if (!_httpClient.DefaultRequestHeaders.UserAgent.Any())
        {
            // User-Agent header for Github API
            _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("PersonalWebsite/1.0");
        }
    }
    
    public async Task<string?> GetCurrentlyPlayingAsync()
    {
        // _logger.LogInformation("Attempting to fetch Currently Playing Song");

        try
        {
            var accessToken = await GetAccessTokenFromRefreshTokenAsync();
            if (string.IsNullOrWhiteSpace(accessToken))
            {
                // _logger.LogError("Could not retrieve access token");
                return null;
            }

            var request = new HttpRequestMessage(HttpMethod.Get, "me/player/currently-playing");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request);

            if (response.StatusCode == HttpStatusCode.NoContent)
            {
                // _logger.LogInformation("User is not currently playing anything.");
                return null;
            }

            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                // _logger.LogInformation("Successfully fetched Currently Playing Song");
                return data;
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                /* _logger.LogWarning("Failed to fetch Currently Playing Song. Status Code: {StatusCode}. Response: {ErrorResponse}",
                    response.StatusCode, errorContent);
                    */
                
                return null;
            }
        }
        catch (Exception ex)
        {
            // _logger.LogError(ex, "An unexpected error occurred while fetching Currently Playing Song");
            return null;
        }
    }
    
    private async Task<string?> GetAccessTokenFromRefreshTokenAsync()
    {
        var clientId = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_ID");
        var clientSecret = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_SECRET");
        var refreshToken = Environment.GetEnvironmentVariable("SPOTIFY_REFRESH_TOKEN");

        var client = new HttpClient();

        var request = new HttpRequestMessage(HttpMethod.Post, "https://accounts.spotify.com/api/token");
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(
            "Basic",
            Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"))
        );

        var body = new Dictionary<string, string>
        {
            ["grant_type"] = "refresh_token",
            ["refresh_token"] = refreshToken!
        };

        request.Content = new FormUrlEncodedContent(body);

        var response = await client.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            // _logger.LogError("Failed to refresh token. Status: {Status}. Error: {Err}", response.StatusCode, err);
            return null;
        }

        var json = await response.Content.ReadAsStringAsync();
        var parsed = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json);
        return parsed?["access_token"].GetString();
    }
}