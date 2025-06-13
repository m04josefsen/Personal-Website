// TODO: cache? ratelimits
document.addEventListener("DOMContentLoaded", (event) => {
    createButtonsForSubjects();
    fetchRepositories();
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
            result += language + ", ";
        }
        result += languages[languages.length - 1];
    }
    
    result += "</p>";
    result += "</div>";

    const container = document.querySelector(".projects"); 
    if (container) {
        container.innerHTML += result;
    }
}