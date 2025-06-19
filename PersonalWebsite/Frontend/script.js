// TODO: cache? ratelimits
document.addEventListener("DOMContentLoaded", (event) => {
    createButtonsForSubjects();
    fetchRepositories();
    fetchLatestEvents();
});

// TEMP: whitelist for subjects
const whitelist = [
    "PERSONAL-WEBSITE",
    "GITHUB-REPOSITORY-STATS",
    "PROJECT-PAWS",
    "TXT-BUNDLER",
    "TERMINAL-ANIME-RECOMMENDATION-PROGRAM"
];

let projectCount = 0;

function createButtonsForSubjects() {
  const buttons = document.querySelectorAll('.tabs button');
  const sections = document.querySelectorAll('.subjects > div');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Deactivates all buttons and sections
      buttons.forEach(btn => btn.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));

      // Activate chosen button and section
      button.classList.add('active');
      document.getElementById(button.getAttribute('data-target')).classList.add('active');
    });
  });
}

async function fetchRepositories() {
    const url = `api/github/user/m04josefsen/repositories`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Response was not ok");
        }
        const data = await response.json();
        console.log("Data:", data);

        // sequentially wait on each createProject()
        for (const project of data) {
            await createProject(project);
            
            // Maximum 4 projects are shown
            if(projectCount == 4) break;
        }

    } catch (error) {
        console.error("There was an error while fetching data", error);
    }
}

async function fetchRepositoryLanguage(repository) {
    const username = "m04josefsen";
    const url = `/api/github/user/${username}/repository/${repository}`;

    console.log(url);

    try {
        const response = await fetch(url, { method: "GET" });

        if (!response.ok) {
            throw new Error("Response was not ok");
        }

        const data = await response.json();
        const languages = Object.keys(data); 
        console.log("Languages:", data);

        return languages;
    } catch (error) {
        console.error("There was an error while fetching data", error);
        return [];
    }
}

async function createProject(projectJSON) {
    // TEMP: only certain repostirores are allowed
    if(!whitelist.includes(projectJSON.name.toUpperCase())) return;
    
    projectCount++;
    
    const languages = await fetchRepositoryLanguage(projectJSON.name);
    
    // TODO: trenger ikke å lage objekt, fjerna languages her
    const project = {
        title : projectJSON.name,
        description : projectJSON.description,
        url : projectJSON.url,
        image : "img/placeholder.jpg"
    };

    let result = "<div class='project'>";
    
    result += "<h3>" + project.title + " •</h3>";
    result += "<p>" + project.description + "</p>";
    result += "<a href='" + project.url + "'><img src='" + project.image + "' alt='" + project.title + "'></a>";
    
    result += "<p>";
    
    // Formats languages with , separation, not the last one
    if(languages.length > 0) {
        for (let i = 0; i < languages.length - 1; i++) {
            result += languages[i] + ", ";
        }
        result += languages[languages.length - 1];
    }
    
    result += "</p>";
    result += "</div>";

    document.querySelector(".projects").innerHTML += result;
}

async function fetchLatestEvents() {
    const username = "m04josefsen";
    const url = `/api/github/user/${username}/events`;

    console.log(url);

    try {
        const response = await fetch(url, { method: "GET" });

        if (!response.ok) {
            throw new Error("Response was not ok");
        }

        const data = await response.json();
        console.log("Data:", data);
        
        await createEvents(data);
    } catch (error) {
        console.error("There was an error while fetching data", error);
        return [];
    }
}

async function createEvents(events) {
    // Only take the first 3 events
    const latestEvents = events.slice(0, 3);

    for (const event of latestEvents) {
        switch (event.type) {
            case "PushEvent":
                await createPushEvent(event);
                break;
            case "PullRequestEvent":
                await createPullRequestEvent(event);
                break;
            case "IssueCommentEvent":
                await createIssueCommentEvent(event);
                break;
            case "IssuesEvent":
                await createIssuesEvent(event);
                break;
            case "WatchEvent":
                await createWatchEvent(event);
                break;
            case "ForkEvent":
                await createForkEvent(event);
                break;
            case "CreateEvent":
                await createCreateEvent(event);
                break;
            case "DeleteEvent":
                await createDeleteEvent(event);
                break;
            case "PublicEvent":
                await createPublicEvent(event);
                break;
            case "PullRequestReviewCommentEvent":
                await createPullRequestReviewCommentEvent(event);
                break;
            default:
                console.log("Unhandled event type:", event.type);
        }
    }
}

function appendToEvents(html) {
    const container = document.querySelector(".events");
    if (container) {
        container.innerHTML += html;
    }
}

async function createPushEvent(event) {
    let result = "<div class='event'>";
    result += "<h3>Push Event — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    event.payload.commits.forEach(commit => {
        result += "<p>Commit: <a href='https://github.com/" + event.repo.name + "/commit/" + commit.sha + "'>" + commit.message + "</a></p>";
    });
    result += "<p class='date'>" + new Date(event.created_at).toLocaleString() + "</p>";
    result += "</div>";

    appendToEvents(result);
}

async function createPullRequestEvent(event) {
    const pr = event.payload.pull_request;

    let result = "<div class='event'>";
    result += "<h3>Pull Request " + event.payload.action + " — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    result += "<p><a href='" + pr.html_url + "'>" + pr.title + "</a></p>";
    result += "<p class='date'>" + new Date(event.created_at).toLocaleString() + "</p>";
    result += "</div>";

    appendToEvents(result);
}

async function createIssueCommentEvent(event) {
    const issue = event.payload.issue;
    const comment = event.payload.comment;

    let result = "<div class='event'>";
    result += "<h3>Issue Comment — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    result += "<p>On Issue: <a href='" + issue.html_url + "'>" + issue.title + "</a></p>";
    result += "<p>Comment: <a href='" + comment.html_url + "'>" + comment.body + "</a></p>";
    result += "<p class='date'>" + new Date(event.created_at).toLocaleString() + "</p>";
    result += "</div>";

    appendToEvents(result);
}

async function createIssuesEvent(event) {
    const issue = event.payload.issue;

    let result = "<div class='event'>";
    result += "<h3>Issue " + event.payload.action + " — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    result += "<p><a href='" + issue.html_url + "'>" + issue.title + "</a></p>";
    result += "<p class='date'>" + new Date(event.created_at).toLocaleString() + "</p>";
    result += "</div>";

    appendToEvents(result);
}

async function createWatchEvent(event) {
    let result = "<div class='event'>";
    result += "<h3>Starred Repository — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    result += "<p class='date'>" + new Date(event.created_at).toLocaleString() + "</p>";
    result += "</div>";

    appendToEvents(result);
}

async function createForkEvent(event) {
    const fork = event.payload.forkee;

    let result = "<div class='event'>";
    result += "<h3>Forked Repository — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    result += "<p>Fork: <a href='" + fork.html_url + "'>" + fork.full_name + "</a></p>";
    result += "<p class='date'>" + new Date(event.created_at).toLocaleString() + "</p>";
    result += "</div>";

    appendToEvents(result);
}

async function createCreateEvent(event) {
    let result = "<div class='event'>";
    result += "<h3>Created " + event.payload.ref_type + " — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    if (event.payload.ref) {
        result += "<p>Ref Name: " + event.payload.ref + "</p>";
    }
    result += "<p class='date'>" + new Date(event.created_at).toLocaleString() + "</p>";
    result += "</div>";

    appendToEvents(result);
}

async function createDeleteEvent(event) {
    let result = "<div class='event'>";
    result += "<h3>Deleted " + event.payload.ref_type + " — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    result += "<p>Ref Name: " + event.payload.ref + "</p>";
    result += "<p class='date'>" + new Date(event.created_at).toLocaleString() + "</p>";
    result += "</div>";

    appendToEvents(result);
}

async function createPublicEvent(event) {
    let result = "<div class='event'>";
    result += "<h3>Made Public — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    result += "<p class='date'>" + new Date(event.created_at).toLocaleString() + "</p>";
    result += "</div>";

    appendToEvents(result);
}

async function createPullRequestReviewCommentEvent(event) {
    const pr = event.payload.pull_request;
    const comment = event.payload.comment;

    let result = "<div class='event'>";
    result += "<h3>PR Review Comment — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    result += "<p>PR: <a href='" + pr.html_url + "'>" + pr.title + "</a></p>";
    result += "<p>Comment: <a href='" + comment.html_url + "'>" + comment.body + "</a></p>";
    result += "<p class='date'>" + new Date(event.created_at).toLocaleString() + "</p>";
    result += "</div>";

    appendToEvents(result);
}

async function fetchCurrentlyPlaying() {
    const url = `api/spotify/currentlyPlaying`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Response was not ok");
        }
        const data = await response.json();
        console.log("Data:", data);

        await createCurrentlyPlaying(data);
    } catch (error) {
        console.error("There was an error while fetching data", error);
    }
}

async function createCurrentlyPlaying(JSON) {
    // TODO: what if podcast?
    // If no song is playing
    if(!JSON.is_playing) {
        let result = "<p>Currently not listening to anything</p>";

        const container = document.querySelector(".spotify");
        if (container) {
            container.innerHTML += result;
        }
        
        return;
    }
    
    // TODO: arist logo and song logo
    const song = {
        name : JSON.item.name,
        href : JSON.item.external_urls.spotify,
        artist : JSON.artists.name,
        artisthref : JSON.item.artsts.external_urls.spotify
    }
    
    // Flex row -> Song logo, song name, artist name under song name, maybe artist Logo?

    // TODO: change the events to this style
    // Song container
    result += "<div class='spotify-container'>";
    result += `<a href='${song.href}'><img src='${song.image}' alt='Song image'></a>`;
    result += `<a href='${song.href}'><p>${song.name}</p></a>`;
    result += "</div>";

    // Artist container
    result += "<div class='spotify-container'>";
    result += `<a href='${song.artisthref}'><img src='placeholder.png' alt='Artist image'></a>`;
    result += `<a href='${song.artisthref}'><p>${song.artist}</p></a>`;
    result += "</div>";

    const container = document.querySelector(".spotify");
    if (container) {
        container.innerHTML += result;
    }
}

/* Currently playing JSON
    {
  "context": {
    "type": "playlist",
    "href": "https://api.spotify.com/v1/playlists/6VSZOzd42OFTxwFrGrYF4K",
    "external_urls": {
      "spotify": "https://open.spotify.com/playlist/6VSZOzd42OFTxwFrGrYF4K"
    },
    "uri": "spotify:playlist:6VSZOzd42OFTxwFrGrYF4K"
  },
  "timestamp": 1750257286634,
  "progress_ms": 6267,
  "is_playing": true,
  "item": {
    "album": {
      "album_type": "single",
      "total_tracks": 5,
      "available_markets": ["AR", "AU", "AT", "BE", "BO", "BR", "BG", "CA", "CL", "CO", "CR", "CY", "CZ", "DK", "DO", "DE", "EC", "EE", "SV", "FI", "FR", "GR", "GT", "HN", "HK", "HU", "IS", "IE", "IT", "LV", "LT", "LU", "MY", "MT", "MX", "NL", "NZ", "NI", "NO", "PA", "PY", "PE", "PH", "PL", "PT", "SG", "SK", "ES", "SE", "CH", "TW", "TR", "UY", "US", "GB", "AD", "LI", "MC", "ID", "JP", "TH", "VN", "RO", "IL", "ZA", "SA", "AE", "BH", "QA", "OM", "KW", "EG", "MA", "DZ", "TN", "LB", "JO", "PS", "IN", "BY", "KZ", "MD", "UA", "AL", "BA", "HR", "ME", "MK", "RS", "SI", "KR", "BD", "PK", "LK", "GH", "KE", "NG", "TZ", "UG", "AG", "AM", "BS", "BB", "BZ", "BT", "BW", "BF", "CV", "CW", "DM", "FJ", "GM", "GE", "GD", "GW", "GY", "HT", "JM", "KI", "LS", "LR", "MW", "MV", "ML", "MH", "FM", "NA", "NR", "NE", "PW", "PG", "PR", "WS", "SM", "ST", "SN", "SC", "SL", "SB", "KN", "LC", "VC", "SR", "TL", "TO", "TT", "TV", "VU", "AZ", "BN", "BI", "KH", "CM", "TD", "KM", "GQ", "SZ", "GA", "GN", "KG", "LA", "MO", "MR", "MN", "NP", "RW", "TG", "UZ", "ZW", "BJ", "MG", "MU", "MZ", "AO", "CI", "DJ", "ZM", "CD", "CG", "IQ", "LY", "TJ", "VE", "ET", "XK"],
      "external_urls": {
        "spotify": "https://open.spotify.com/album/3lyRrGhXCCMbt4jVO9Wur2"
      },
      "href": "https://api.spotify.com/v1/albums/3lyRrGhXCCMbt4jVO9Wur2",
      "id": "3lyRrGhXCCMbt4jVO9Wur2",
      "images": [
        {
          "url": "https://i.scdn.co/image/ab67616d0000b27386efcf81bf1382daa2d2afe6",
          "height": 640,
          "width": 640
        },
        {
          "url": "https://i.scdn.co/image/ab67616d00001e0286efcf81bf1382daa2d2afe6",
          "height": 300,
          "width": 300
        },
        {
          "url": "https://i.scdn.co/image/ab67616d0000485186efcf81bf1382daa2d2afe6",
          "height": 64,
          "width": 64
        }
      ],
      "name": "HOT",
      "release_date": "2025-03-14",
      "release_date_precision": "day",
      "type": "album",
      "uri": "spotify:album:3lyRrGhXCCMbt4jVO9Wur2",
      "artists": [
        {
          "external_urls": {
            "spotify": "https://open.spotify.com/artist/4SpbR6yFEvexJuaBpgAU5p"
          },
          "href": "https://api.spotify.com/v1/artists/4SpbR6yFEvexJuaBpgAU5p",
          "id": "4SpbR6yFEvexJuaBpgAU5p",
          "name": "LE SSERAFIM",
          "type": "artist",
          "uri": "spotify:artist:4SpbR6yFEvexJuaBpgAU5p"
        }
      ]
    },
    "artists": [
      {
        "external_urls": {
          "spotify": "https://open.spotify.com/artist/4SpbR6yFEvexJuaBpgAU5p"
        },
        "href": "https://api.spotify.com/v1/artists/4SpbR6yFEvexJuaBpgAU5p",
        "id": "4SpbR6yFEvexJuaBpgAU5p",
        "name": "LE SSERAFIM",
        "type": "artist",
        "uri": "spotify:artist:4SpbR6yFEvexJuaBpgAU5p"
      }
    ],
    "available_markets": ["AR", "AU", "AT", "BE", "BO", "BR", "BG", "CA", "CL", "CO", "CR", "CY", "CZ", "DK", "DO", "DE", "EC", "EE", "SV", "FI", "FR", "GR", "GT", "HN", "HK", "HU", "IS", "IE", "IT", "LV", "LT", "LU", "MY", "MT", "MX", "NL", "NZ", "NI", "NO", "PA", "PY", "PE", "PH", "PL", "PT", "SG", "SK", "ES", "SE", "CH", "TW", "TR", "UY", "US", "GB", "AD", "LI", "MC", "ID", "JP", "TH", "VN", "RO", "IL", "ZA", "SA", "AE", "BH", "QA", "OM", "KW", "EG", "MA", "DZ", "TN", "LB", "JO", "PS", "IN", "BY", "KZ", "MD", "UA", "AL", "BA", "HR", "ME", "MK", "RS", "SI", "KR", "BD", "PK", "LK", "GH", "KE", "NG", "TZ", "UG", "AG", "AM", "BS", "BB", "BZ", "BT", "BW", "BF", "CV", "CW", "DM", "FJ", "GM", "GE", "GD", "GW", "GY", "HT", "JM", "KI", "LS", "LR", "MW", "MV", "ML", "MH", "FM", "NA", "NR", "NE", "PW", "PG", "PR", "WS", "SM", "ST", "SN", "SC", "SL", "SB", "KN", "LC", "VC", "SR", "TL", "TO", "TT", "TV", "VU", "AZ", "BN", "BI", "KH", "CM", "TD", "KM", "GQ", "SZ", "GA", "GN", "KG", "LA", "MO", "MR", "MN", "NP", "RW", "TG", "UZ", "ZW", "BJ", "MG", "MU", "MZ", "AO", "CI", "DJ", "ZM", "CD", "CG", "IQ", "LY", "TJ", "VE", "ET", "XK"],
    "disc_number": 1,
    "duration_ms": 143797,
    "explicit": false,
    "external_ids": {
      "isrc": "USA2P2506404"
    },
    "external_urls": {
      "spotify": "https://open.spotify.com/track/406IpEtZPvbxApWTGM3twY"
    },
    "href": "https://api.spotify.com/v1/tracks/406IpEtZPvbxApWTGM3twY",
    "id": "406IpEtZPvbxApWTGM3twY",
    "name": "HOT",
    "popularity": 81,
    "preview_url": null,
    "track_number": 2,
    "type": "track",
    "uri": "spotify:track:406IpEtZPvbxApWTGM3twY",
    "is_local": false
  },
  "currently_playing_type": "track",
  "actions": {
    "disallows": {
      "resuming": true
    }
  }
}

 */