using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Models.Strapi
{
    public class Meta
    {
#nullable enable
        [JsonPropertyName("pagination")]
        public Pagination? Pagination { get; set; }
#nullable disable
    }
}
