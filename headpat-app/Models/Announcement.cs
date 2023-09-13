using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.Models
{
    [JsonConverter(typeof(JsonPathConverter))]
    public class Announcement
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("attributes.title")]
        public string Title { get; set; }

        [JsonProperty("attributes.description")]
        public string Description { get; set; }

        [JsonProperty("attributes.sidetext")]
        public string SideText { get; set; }

        [JsonProperty("attributes.createdAt")]
        public DateTime Created { get; set; }

        [JsonProperty("attributes.updatedAt")]
        public DateTime Updated { get; set; }

        [JsonProperty("attributes.validuntil")]
        public DateTime ValidUntil { get; set; }
        [JsonIgnore]
        public User User { get; set; }
    }
}
