using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.Services
{
    public class AnnouncementsService
    {
        HttpClient httpClient;
        List<Announcement> announcements = new();

        public AnnouncementsService()
        {
            httpClient = new HttpClient();
        }

        public async Task<List<Announcement>> GetAnnouncements()
        {
            if (announcements?.Count > 0)
                return announcements;

            var response = await httpClient.GetAsync("https://backend.headpat.de/api/announcements");

            if (response.IsSuccessStatusCode)
            {
                var json = JObject.Parse(await response.Content.ReadAsStringAsync());
                announcements = JsonConvert.DeserializeObject<List<Announcement>>(json["data"].ToString());
            }
            else
                throw new Exception($"Error while fetching announcements: {response.StatusCode}");

            return announcements;
        }
    }
}
