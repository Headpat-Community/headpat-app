using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Models.Strapi
{
    public class FormatImage
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("hash")]
        public string Hash { get; set; }

        [JsonPropertyName("ext")]
        public string Ext { get; set; }

        [JsonPropertyName("mime")]
        public string MimeType { get; set; }

        [JsonPropertyName("path")]
        public object Path { get; set; }

        [JsonPropertyName("width")]
        public int Width { get; set; }

        [JsonPropertyName("height")]
        public int Height { get; set; }

        [JsonPropertyName("size")]
        public float Size { get; set; }

        [JsonPropertyName("url")]
        public string Url { get; set; }
    }
}
