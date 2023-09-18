using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Models.Strapi
{
    public class Formats
    {
#nullable enable
        [JsonPropertyName("thumbnail")]
        public FormatImage? ThumbnailImage { get; set; }

        [JsonPropertyName("small")]
        public FormatImage? SmallImage { get; set; }

        [JsonPropertyName("medium")]
        public FormatImage? MediumImage { get; set; }
#nullable disable
    }
}
