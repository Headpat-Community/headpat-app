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

            _announcements = response.Data;

            foreach (var announcement in _announcements)
            {
                announcement.Attributes.CreatedBy_UserData = await _userService.GetUserData(announcement.Attributes.CreatedBy.Data.Id);
                announcement.Attributes.CreatedBy = null;
            }

            return _announcements;
        }
    }
}
