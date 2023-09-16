using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.Services
{
    public class ProfileService : BaseService
    {
        Profile _profile = new();

        public async Task<Profile> GetProfileAsync(int id)
        {
            if (_profile?.Id != null && _profile.Id == id)
                return _profile;

            var response = await _httpClient.GetAsync(string.Format(Endpoints.GET_USER_DATA, id));

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Error while fetching profile: {response.StatusCode}");

            var json = JObject.Parse(await response.Content.ReadAsStringAsync());
            _profile = JsonConvert.DeserializeObject<Profile>(json["data"].ToString());

            _profile.User.AvatarUrl = json["data"]["attributes"]["avatar"]["data"]["attributes"]["formats"]["small"]["url"].ToString();
            return _profile;
        }
    }
}
