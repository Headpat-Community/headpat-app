using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.Services
{
    public class AnnouncementsService : BaseService
    {
        List<Announcement> _announcements = new();

        public async Task<List<Announcement>> GetAnnouncementsAsync(bool isRefreshing = false)
        {
            if (_announcements?.Count > 0 && !isRefreshing)
                return _announcements;

            var response = await _httpClient.GetAsync(Endpoints.GET_ANNOUNCEMENTS);

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Error while fetching announcements: {response.StatusCode}");

            var json = JObject.Parse(await response.Content.ReadAsStringAsync());
            _announcements = JsonConvert.DeserializeObject<List<Announcement>>(json["data"].ToString());

            var cachedUsers = new Dictionary<int, User>();

            foreach (var announcement in _announcements)
            {
                if (cachedUsers.ContainsKey(announcement.CreatedBy))
                {
                    announcement.CreatedByUser = cachedUsers[announcement.CreatedBy];
                    continue;
                }

                var responseUser = await _httpClient.GetAsync(string.Format(Endpoints.GET_USER_DATA, announcement.CreatedBy));

                if (!responseUser.IsSuccessStatusCode)
                    throw new Exception($"Error while fetching announcements: {response.StatusCode}");

                var jsonUser = JObject.Parse(await responseUser.Content.ReadAsStringAsync());

                announcement.CreatedByUser = JsonConvert.DeserializeObject<User>(jsonUser["data"]["attributes"]["users_permissions_user"].ToString());
                announcement.CreatedByUser.AvatarUrl = jsonUser["data"]["attributes"]["avatar"]["data"]["attributes"]["formats"]["small"]["url"].ToString();

                cachedUsers.Add(announcement.CreatedBy, announcement.CreatedByUser);
            }

            return _announcements;
        }
    }
}
