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
            // TODO: User agent for spotify?
            // User-Agent header for Github API
            _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("PersonalWebsite/1.0");
        }
    }
    
    public async Task<string?> GetCurrentlyPlayingAsync()
    {
        _logger.LogInformation("Attempting to fetch Currently Playing Song");

        try
        {
            /* Currently fixed in program.cs
            string accessToken = "ACCESS_TOKEN";

            // Add the Authorization header
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
                */
            
            HttpResponseMessage response = await _httpClient.GetAsync($"me/player/currently-playing");
            
            // TODO: egen melding om 204 not playing
            
            if (response.IsSuccessStatusCode)
            {
                // String
                var data = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("Successfully fetched Currently Playing Song");
                return data;
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Failed to fetch Currently Playing Song. Status Code: {StatusCode}. Response: {ErrorResponse}", 
                    response.StatusCode, errorContent);
                    
                // TODO: throw specific exceptions for different error types (404, 500 etc)
                return null; 
            }
        }
        catch (Exception ex) 
        {
            _logger.LogError(ex, "An unexpected error occurred while fetching Currentyly Playing Song");
            return null; // TODO: throw exception
        }
    }
}