using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Models.Strapi
{
    public class Error
    {
#nullable enable
        [JsonPropertyName("status")]
        public long Status { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }
#nullable disable
    }
}
