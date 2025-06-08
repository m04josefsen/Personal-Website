using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers; 
using System.Threading.Tasks;
using Microsoft.Extensions.Logging; 

namespace PersonalWebsite_Backend.Services
{
    public class GithubService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<GithubService> _logger;

        public GithubService(HttpClient httpClient, ILogger<GithubService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;

            // Set in Program.cs, double check
            if (_httpClient.BaseAddress == null)
            {
                _httpClient.BaseAddress = new Uri("https://api.github.com/");
            }
            if (!_httpClient.DefaultRequestHeaders.UserAgent.Any())
            {
                // User-Agent header for Github API
                _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("PersonalWebsite-Backend/1.0");
            }
        }

        public async Task<string?> GetUserAsync(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                _logger.LogWarning("GetUserAsync called with null or whitespace username.");
                throw new ArgumentNullException(nameof(username));
            }

            _logger.LogInformation("Attempting to fetch GitHub user: {Username}", username);

            try
            {
                HttpResponseMessage response = await _httpClient.GetAsync($"users/{username}");

                if (response.IsSuccessStatusCode)
                {
                    // String
                    var data = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("Successfully fetched data for GitHub user: {Username}", username);
                    return data;
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Failed to fetch GitHub user {Username}. Status Code: {StatusCode}. Response: {ErrorResponse}",
                        username, response.StatusCode, errorContent);
                    
                    // TODO: throw specific exceptions for different error types (404, 500 etc)
                    return null; 
                }
            }
            catch (Exception ex) 
            {
                _logger.LogError(ex, "An unexpected error occurred while fetching GitHub user {Username}.", username);
                return null; // TODO: throw exception
            }
        }
        
        public async Task<string?> GetRepositoriesAsync(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                _logger.LogWarning("GetRepositoriesAsync called with null or whitespace username.");
                throw new ArgumentNullException(nameof(username));
            }

            _logger.LogInformation("Attempting to fetch GitHub user: {Username}", username);

            try
            {
                HttpResponseMessage response = await _httpClient.GetAsync($"users/{username}/repos");

                if (response.IsSuccessStatusCode)
                {
                    // String
                    var data = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("Successfully fetched respositories for GitHub user: {Username}", username);
                    return data;
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Failed to fetch GitHub user {Username}. Status Code: {StatusCode}. Response: {ErrorResponse}",
                        username, response.StatusCode, errorContent);
                    
                    // TODO: throw specific exceptions for different error types (404, 500 etc)
                    return null; 
                }
            }
            catch (Exception ex) 
            {
                _logger.LogError(ex, "An unexpected error occurred while fetching GitHub user {Username}.", username);
                return null; // TODO: throw exception
            }
        }
        
        // /repos/{owner}/{repo} only shows one language
        public async Task<string?> GetRepositoryLanguagesAsync(string username, string repository)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                _logger.LogWarning("GetRepositoryLanguagesAsync called with null or whitespace username/repository.");
                throw new ArgumentNullException(nameof(username));
            }

            // TODO: fjern logg?
            // _logger.LogInformation("Attempting to fetch GitHub user: {Username}", username);

            try
            {
                HttpResponseMessage response = await _httpClient.GetAsync($"repos/{username}/{repository}/languages");

                // TODO: fiks logg på alle
                if (response.IsSuccessStatusCode)
                {
                    // String
                    var data = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("Successfully fetched respositories for GitHub user: {Username}", username);
                    return data;
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Failed to fetch GitHub user {Username}. Status Code: {StatusCode}. Response: {ErrorResponse}",
                        username, response.StatusCode, errorContent);
                    
                    // TODO: throw specific exceptions for different error types (404, 500 etc)
                    return null; 
                }
            }
            catch (Exception ex) 
            {
                _logger.LogError(ex, "An unexpected error occurred while fetching GitHub user {Username}.", username);
                return null; // TODO: throw exception
            }
        }
    }
}
