using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Services
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

#nullable enable
        public async Task<User?> GetAuthenticatedUser()
        {

            var userData = await SecureStorage.GetAsync("AuthenticatedUser");

            if (userData is null)
                return null;

            try
            {
                var json = JObject.Parse(userData);
                var token = new JwtSecurityTokenHandler().ReadJwtToken(json["jwt"].ToString());

                if (token.ValidTo < DateTime.UtcNow)
                    return null;

                return JsonConvert.DeserializeObject<User>(json["user"].ToString());
            }
            catch (Exception ex)
            {
                Debug.Write(ex);
                return null;
            }
        }
#nullable disable
    }
}
