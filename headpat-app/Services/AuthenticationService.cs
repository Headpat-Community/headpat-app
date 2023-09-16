using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.Services
{
    public class AuthenticationService : BaseService
    {
        public async Task<string> LoginUserAsync(string eMail, string password)
        {
            _httpClient.DefaultRequestHeaders.Authorization = null;

            Dictionary<string, string> values = new()
            {
                { "identifier", eMail },
                { "password", password }
            };

            FormUrlEncodedContent content = new(values);

            var response = await _httpClient.PostAsync(Endpoints.LOGIN_USER, content);

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Error while logging in: {response.StatusCode}");

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<Profile> GetProfileAsync(int id)
        {
            Profile profile;

            var response = await _httpClient.GetAsync(string.Format(Endpoints.GET_USER_DATA, id));

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Error while fetching profile: {response.StatusCode}");

            var json = JObject.Parse(await response.Content.ReadAsStringAsync());
            profile = JsonConvert.DeserializeObject<Profile>(json["data"].ToString());

            profile.User.AvatarUrl = json["data"]["attributes"]["avatar"]["data"]["attributes"]["formats"]["small"]["url"].ToString();
            return profile;
        }
    }
}
