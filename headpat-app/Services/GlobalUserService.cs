using HeadpatCommunity.HeadpatApp.Models.Strapi.Custom;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Services
{
    public class GlobalUserService : BaseService
    {
        public Dictionary<int, UserData> CachedUserData { get; set; } = new();
        const int CACHE_EXPIRATION_MINUTES = 15;

        public async Task<UserData> GetUserData(int id)
        {
            if (CachedUserData.ContainsKey(id) && (DateTime.Now - CachedUserData[id].Updated).TotalMinutes < CACHE_EXPIRATION_MINUTES)
                return CachedUserData[id];

            var userDataResponse = await _client.GetFromJsonAsync<Response<UserData>>(string.Format(Endpoints.GET_USER_DATA, id));

            if (userDataResponse?.Data is null || userDataResponse.Error is not null)
                throw new Exception($"Error while fetching announcements.");

            if (CachedUserData.ContainsKey(id))
                CachedUserData[id] = userDataResponse.Data;
            else
                CachedUserData.Add(id, userDataResponse.Data);

            return userDataResponse.Data;
        }
    }
}
