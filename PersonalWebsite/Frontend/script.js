createButtonsForSubjects();
fetchRepositories();

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

function fetchRepositories() {
    const url = `api/github/user/m04josefsen/repositories`;

    fetch(url, {
        method: "GET",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log("Data:", data);
            
            data.forEach((project) => {
                createProject(project);
            })
            
        })
        .catch(error => {
            console.error("There was an error while fetching data", error);
        });
}

function fetchRepositoryLanguage(repository) {
    const username = "m04josefsen";
    const url = `/api/github/user/${username}/repository/${repository}`;

    console.log(url);
    
    fetch(url, {
        method: "GET",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log("Languages:", data);
            
            let languages = [];
            
            // TODO: fordi det er Langua:linjer
            
            data.forEach((language) => {
                languages.push(language);
            })
            
            return languages;
        })
        .catch(error => {
            console.error("There was an error while fetching data", error);
        });
}

function createProject(projectJSON) { 
    // TODO: send in title som du får fra en annen metode
    const languages = fetchRepositoryLanguage(projectJSON.name);
    
    console.log(languages);
    
    // TODO: trenger ikke å lage objekt
    const project = {
        title : projectJSON.name,
        description : projectJSON.description,
        url : projectJSON.url,
        image : "img/placeholder.jpg",
        //languages : languages
    };

    let result = "<div class='project'>";
    
    result += "<h3>" + project.title + "</h3>";
    result += "<p>" + project.description + "</p>";
    result += "<a href='" + project.url + "'><img src='" + project.image + "' alt='" + project.title + "'></a>";
    /*
    result += "<p>";
    
    for (let language of project.languages) {
        result += language + " ";
    }
    result += "</p>";
     */
    result += "</div>";

    const container = document.querySelector(".projects"); 
    if (container) {
        container.innerHTML += result;
    }
}