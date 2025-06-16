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
    result += "</div>";
    
    appendToEvents(result);
}

async function createPullRequestEvent(event) {
    const pr = event.payload.pull_request;
    
    let result = "<div class='event'>";
    result += "<h3>Pull Request " + event.payload.action + " — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    result += "<p><a href='" + pr.html_url + "'>" + pr.title + "</a></p>";
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
    result += "</div>";
    
    appendToEvents(result);
}

async function createIssuesEvent(event) {
    const issue = event.payload.issue;
    
    let result = "<div class='event'>";
    result += "<h3>Issue " + event.payload.action + " — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    result += "<p><a href='" + issue.html_url + "'>" + issue.title + "</a></p>";
    result += "</div>";
    
    appendToEvents(result);
}

async function createWatchEvent(event) {
    let result = "<div class='event'>";
    result += "<h3>Starred Repository — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    result += "</div>";
    
    appendToEvents(result);
}

async function createForkEvent(event) {
    const fork = event.payload.forkee;
    
    let result = "<div class='event'>";
    result += "<h3>Forked Repository — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    result += "<p>Fork: <a href='" + fork.html_url + "'>" + fork.full_name + "</a></p>";
    result += "</div>";
    
    appendToEvents(result);
}

async function createCreateEvent(event) {
    let result = "<div class='event'>";
    result += "<h3>Created " + event.payload.ref_type + " — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    if (event.payload.ref) {
        result += "<p>Ref Name: " + event.payload.ref + "</p>";
    }
    result += "</div>";
    
    appendToEvents(result);
}

async function createDeleteEvent(event) {
    let result = "<div class='event'>";
    result += "<h3>Deleted " + event.payload.ref_type + " — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
    result += "<p>Ref Name: " + event.payload.ref + "</p>";
    result += "</div>";
    
    appendToEvents(result);
}

async function createPublicEvent(event) {
    let result = "<div class='event'>";
    result += "<h3>Made Public — <a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a></h3>";
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
    result += "</div>";
    
    appendToEvents(result);
}