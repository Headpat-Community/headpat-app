using Newtonsoft.Json;

namespace HeadpatCommunity.HeadpatApp.Models
{
    [JsonConverter(typeof(JsonPathConverter))]
    public class GalleryItem
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("attributes.name")]
        public string Name { get; set; }

        [JsonProperty("attributes.longtext")]
        public string Description { get; set; }

        [JsonProperty("attributes.imgalt")]
        public string AlternativeText { get; set; }

        [JsonProperty("attributes.nsfw")]
        public bool IsNsfw { get; set; }

        [JsonIgnore]
        public bool IsNotNsfw => !IsNsfw; // Is Not Not Safe For Work :1lolol:

        [JsonProperty("attributes.createdAt")]
        public DateTime Created { get; set; }

        [JsonProperty("attributes.img.data.attributes.url")]
        public string ImageUrl { get; set; }

        [JsonProperty("attributes.img.data.attributes.formats.small.url")]
        public string SmallImageUrl { get; set; }

        [JsonIgnore]
        public string FinalImageUrl
        {
            get
            {
                if (ImageUrl.EndsWith(".gif") || SmallImageUrl is null)
                    return ImageUrl;
                else
                    return SmallImageUrl;
            }
        }

        [JsonProperty("attributes.users_permissions_user.data")]
        public User User { get; set; }
    }
}
