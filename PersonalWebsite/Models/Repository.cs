using System.Collections;

namespace PersonalWebsite.Models;

public class Repository
{
    // From /repos/{owner}/{repo}
    public string Name { get; set; }
    public string Url { get; set; }
    public string Description { get; set; }

    // From /repos/{owner}/{repo}/languages
    public ArrayList Languages { get; set; }
    
    class Language
    {
        public String Name { get; set; }
        public int Amount { get; set; }
    }
}