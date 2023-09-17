using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Models.Strapi
{
    public class UserAuthentication
    {
        [JsonPropertyName("jwt")]
        public string Jwt { get; set; }

        [JsonPropertyName("user")]
        public UsersPermissionsUserAttributes UserAttributes { get; set; }
    }
}
