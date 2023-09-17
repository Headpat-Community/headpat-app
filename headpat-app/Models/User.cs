using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Models
{
    [JsonConverter(typeof(JsonPathConverter))]
    public class User
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("attributes.username")]
        public string UserName { get; set; }
      
#nullable enable
        [JsonIgnore]
        public string? Password { get; set; }
#nullable disable

        [JsonProperty("attributes.email")]
        public string EMail { get; set; }

        [JsonProperty("attributes.confirmed")]    
        public bool IsConfirmed { get; set; }

        [JsonProperty("attributes.blocked")]
        public bool IsBlocked { get; set; }

        [JsonProperty("attributes.createdAt")]    
        public DateTime Created { get; set; }
        
        [JsonProperty("attributes.updatedAt")]
        public DateTime Updated { get; set; }

        [JsonIgnore]
        public string AvatarUrl { get; set; }
    }
}
