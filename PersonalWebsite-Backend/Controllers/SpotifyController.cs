using Microsoft.AspNetCore.Mvc;
using PersonalWebsite_Backend.Services;

namespace PersonalWebsite_Backend.Controllers;

[ApiController]
[Route("api[/controller]")]
public class SpotifyController : ControllerBase
{
    private readonly SpotifyService _spotifyService;
    private readonly ILogger<SpotifyController> _logger;

    public SpotifyController(SpotifyService spotifyService, ILogger<SpotifyController> logger)
    {
        _spotifyService = spotifyService;
        _logger = logger;
    }
    
    // TODO: more status code?
    // api/spotify/currentlyplaying
    [HttpGet("currentlyplaying")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)] 
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetCurrentlyPlaying()
    {
        try
        {
            _logger.LogInformation("Processing request for Fetching Currently Playing Song");
            // Await the call to the asynchronous service method
            var userDataJson = await _spotifyService.GetCurrentlyPlayingAsync();

            if (userDataJson != null)
            {
                // The Spotify returns JSON, we forward
                // TODO: format data
                return Content(userDataJson, "application/json");
            }
            else
            {
                _logger.LogInformation("TODO: ");
                return NotFound("No data available");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while processing request for Fetching Currently Playing Song");
            return StatusCode(StatusCodes.Status500InternalServerError, "Error occurred. Please try again later.");
        }
    }
}