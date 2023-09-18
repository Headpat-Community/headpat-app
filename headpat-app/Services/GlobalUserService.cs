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

        public async Task<UserData> GetUserData(int id)
        {
            var userDataResponse = await _client.GetFromJsonAsync<Response<UserData>>(string.Format(Endpoints.GET_USER_DATA, id));

            if (userDataResponse?.Data is null || userDataResponse.Error is not null)
                throw new Exception($"Error while fetching announcements.");

            return userDataResponse.Data;
        }
    }
}
