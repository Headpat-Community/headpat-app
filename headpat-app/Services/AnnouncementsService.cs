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
        HttpClient _httpClient;
        List<Announcement> announcements = new();

        public AnnouncementsService()
        {
            _httpClient = new();
        }

        public async Task<List<Announcement>> GetAnnouncements(bool isRefreshing = false)
        {
            if (announcements?.Count > 0 && !isRefreshing)
                return announcements;

            var response = await _httpClient.GetAsync(Endpoints.GET_ANNOUNCEMENTS);

            if (response.IsSuccessStatusCode)
            {
                var json = JObject.Parse(await response.Content.ReadAsStringAsync());
                announcements = JsonConvert.DeserializeObject<List<Announcement>>(json["data"].ToString());

                var cachedUsers = new Dictionary<int, User>();

                foreach (var announcement in announcements)
                {
                    if (cachedUsers.ContainsKey(announcement.CreatedBy))
                        announcement.CreatedByUser = cachedUsers[announcement.CreatedBy];
                    else
                    {
                        var responseUser = await _httpClient.GetAsync(string.Format(Endpoints.GET_USER, announcement.CreatedBy));

                        if (responseUser.IsSuccessStatusCode)
                        {
                            var jsonUser = JObject.Parse(await responseUser.Content.ReadAsStringAsync());

                            announcement.CreatedByUser = JsonConvert.DeserializeObject<User>(jsonUser["data"]["attributes"]["users_permissions_user"].ToString());
                            announcement.CreatedByUser.AvatarUrl = jsonUser["data"]["attributes"]["avatar"]["data"]["attributes"]["formats"]["small"]["url"].ToString();

                            cachedUsers.Add(announcement.CreatedBy, announcement.CreatedByUser);
                        }
                    }
                }
            }
            else
                throw new Exception($"Error while fetching announcements: {response.StatusCode}");

            return announcements;
        }
    }
}
