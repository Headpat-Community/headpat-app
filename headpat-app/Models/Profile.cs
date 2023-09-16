using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.Models
{
    [JsonConverter(typeof(JsonPathConverter))]
    public class Profile
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("attributes.bio")]
        public string Bio { get; set; }

        [JsonProperty("attributes.birthday")]
        public DateTime DateOfBirth { get; set; }

        [JsonProperty("attributes.displayname")]
        public string DisplayName { get; set; }

        [JsonProperty("attributes.pronouns")]
        public string Pronouns { get; set; }

        [JsonProperty("attributes.discordname")]
        public string DiscordName { get; set; }

        [JsonProperty("attributes.telegramname")]
        public string TelegramName { get; set; }

        [JsonProperty("attributes.furaffinityname")]
        public string FurAffinityName { get; set; }

        [JsonProperty("attributes.X_name")]
        public string XName { get; set; } //Twitter

        [JsonProperty("attributes.createdAt")]
        public DateTime Created { get; set; }

        [JsonProperty("attributes.updatedAt")]
        public DateTime Updated { get; set; }

        [JsonProperty("attributes.enablensfw")]
        public bool IsNsfwEnabled { get; set; }

        [JsonProperty("attributes.pats")]
        public long Pats { get; set; }

        [JsonProperty("attributes.location")]
        public string Location { get; set; }

        [JsonProperty("attributes.users_permissions_user.data")]
        public User User { get; set; }
    }
}
