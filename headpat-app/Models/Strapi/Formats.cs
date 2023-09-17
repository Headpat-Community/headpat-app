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
        public ImageData? ThumbnailImage { get; set; }

        [JsonPropertyName("small")]
        public ImageData? SmallImage { get; set; }

        [JsonPropertyName("medium")]
        public ImageData? MediumImage { get; set; }
#nullable disable
    }
}
