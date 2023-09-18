using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HeadpatCommunity.HeadpatApp.Models;
using System.Text.Json.Serialization;
using System.Text.Json;
using System.Net.Http.Json;
using Microsoft.IdentityModel.Tokens;


namespace HeadpatCommunity.HeadpatApp.Services
{
    public class AnnouncementsService : BaseService
    {
        List<Announcement> _announcements = new();

        public AnnouncementsService(GlobalUserService userService) : base(userService) { }

        public async Task<List<Announcement>> GetAnnouncementsAsync(bool isRefreshing = false)
        {
            if (_announcements?.Count > 0 && !isRefreshing)
                return _announcements;

            var response = await _client.GetFromJsonAsync<ResponseList<Announcement>>(Endpoints.GET_ANNOUNCEMENTS);

            if (response?.Data is null || response.Error is not null)
                throw new Exception($"Error while fetching announcements.");

            foreach (var announcement in response.Data)
            {
                if (_userService.CachedUserData.ContainsKey(announcement.Attributes.CreatedBy.Data.Id))
                {
                    announcement.Attributes.CreatedBy_UserData = _userService.CachedUserData[announcement.Attributes.CreatedBy.Data.Id];
                    continue;
                }

                var userData = await _userService.GetUserData(announcement.Attributes.CreatedBy.Data.Id);

                announcement.Attributes.CreatedBy_UserData = userData;
                _userService.CachedUserData.Add(announcement.Attributes.CreatedBy.Data.Id, userData);
            }

            _announcements = response.Data;

            return _announcements;
        }
    }
}
