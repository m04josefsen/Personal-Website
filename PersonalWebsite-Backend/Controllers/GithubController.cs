using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging; 
using PersonalWebsite_Backend.Services;

namespace PersonalWebsite_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class GithubController : ControllerBase
    {
        private readonly GithubService _githubService;
        private readonly ILogger<GithubController> _logger;

        public GithubController(GithubService githubService, ILogger<GithubController> logger)
        {
            _githubService = githubService;
            _logger = logger;
        }

        [HttpGet("user/{username}")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)] 
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetGithubUserInformation([FromRoute] string username)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                _logger.LogWarning("GetGithubUserInformation called with empty username.");
                return BadRequest("Username must be provided.");
            }

            try
            {
                _logger.LogInformation("Processing request for GitHub user: {Username}", username);
                // Await the call to the asynchronous service method.
                var userDataJson = await _githubService.GetUserAsync(username);

                if (userDataJson != null)
                {
                    // The GitHub API returns JSON, we forward
                    return Content(userDataJson, "application/json");
                }
                else
                {
                    _logger.LogInformation("GitHub user {Username} not found or error during service call.", username);
                    return NotFound($"Information for GitHub user '{username}' could not be found or retrieved.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while processing request for GitHub user {Username}.", username);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error occurred. Please try again later.");
            }
        }
    }
}
