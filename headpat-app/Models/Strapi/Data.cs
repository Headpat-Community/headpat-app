using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Models.Strapi
{
    public abstract class Data<T> where T : Attributes
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("attributes")]
        public T Attributes { get; set; }
    }
}
