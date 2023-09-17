using HeadpatCommunity.HeadpatApp.Models.Strapi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Models
{
#nullable enable
    public abstract class ResponseBase
    {
        [JsonPropertyName("meta")]
        public Meta? Meta { get; set; }

        [JsonPropertyName("error")]
        public Error? Error { get; set; }
    }
    public class Response<T> : ResponseBase
    {
        [JsonPropertyName("data")]
        public T? Data { get; set; }
    }

    public class ResponseList<T> : ResponseBase
    {
        [JsonPropertyName("data")]
        public List<T>? Data { get; set; }
    }
#nullable disable
}
