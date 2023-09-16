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
    public abstract class BaseService
    {
        protected HttpClient _httpClient;

        public BaseService()
        {
            _httpClient = new();
        }

#nullable enable
        public static async Task<User?> GetAuthenticatedUser()
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
