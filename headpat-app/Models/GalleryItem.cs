using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using static Microsoft.Maui.Controls.Internals.Profile;
using JsonIgnoreAttribute = Newtonsoft.Json.JsonIgnoreAttribute;

namespace HeadpatCommunity.Mobile.HeadpatApp.Models
{
    public class GalleryItem
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public bool IsNsfw { get; set; }
        public DateTime Created { get; set; }
        public string ImageUrl { get; set; }

        public ImageSource Image => ImageSource.FromUri(new Uri(ImageUrl));
        public string ThumbnailImageUrl { get; set; }
    }
}
