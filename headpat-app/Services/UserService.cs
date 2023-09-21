using HeadpatCommunity.HeadpatApp.Models.Strapi.Custom;
using HeadpatCommunity.HeadpatApp.Services.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Services
{
    public class UserService : HttpService
    {
        public Dictionary<int, UserData> CachedUserData { get; set; } = new();
        const int CACHE_EXPIRATION_MINUTES = 15;

        public async Task AddToCache(params int[] userIds)
        {
            var idsToFetch = new List<int>();

            foreach (int userId in userIds)
            {
                if (CachedUserData.ContainsKey(userId) &&
                    (DateTime.Now - CachedUserData[userId].Updated).TotalMinutes < CACHE_EXPIRATION_MINUTES)
                    continue;

                idsToFetch.Add(userId);
            }

            if (idsToFetch.Count < 1)
                return;

            var sb = new StringBuilder();

            for (var i = 0; i < idsToFetch.Count; i++)
                sb.AppendFormat(Endpoints.USER_DATA_USER_FILTER, i, idsToFetch[i]);

            var response = await Client.GetFromJsonAsync<ResponseList<UserData>>($"{Endpoints.GET_USER_DATA}{sb}");

            if (response?.Data is null || response.Error is not null)
                throw new Exception($"Error while fetching announcements.");

            foreach (UserData userData in response.Data)
                CachedUserData[userData.Id] = userData;
        }

        public async Task<UserData> GetUserData(int id)
        {
            if (CachedUserData.ContainsKey(id) &&
                (DateTime.Now - CachedUserData[id].Updated).TotalMinutes < CACHE_EXPIRATION_MINUTES)
                return CachedUserData[id];

            var userDataResponse = await Client.GetFromJsonAsync<Response<UserData>>(string.Format(Endpoints.GET_USER_DATA, id));

            if (userDataResponse?.Data is null || userDataResponse.Error is not null)
                throw new Exception($"Error while fetching announcements.");

            if (CachedUserData.ContainsKey(id))
                CachedUserData[id] = userDataResponse.Data;
            else
                CachedUserData.Add(id, userDataResponse.Data);

            return userDataResponse.Data;
        }

        public async Task<string> LoginUserAsync(string eMail, string password)
        {
            Dictionary<string, string> values = new()
            {
                { "identifier", eMail },
                { "password", password }
            };

            FormUrlEncodedContent content = new(values);

            var response = await Client.PostAsync(Endpoints.LOGIN_USER, content);

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Error while logging in: {response.StatusCode}");

            return await response.Content.ReadAsStringAsync();
        }
    }
}
