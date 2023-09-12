using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.Services
{
    public class GalleryService
    {
        HttpClient httpClient;
        List<GalleryItem> galleryItems = new();

        public GalleryService()
        {
            httpClient = new HttpClient();
        }

        public async Task<List<GalleryItem>> GetGalleryItems()
        {
            if (galleryItems?.Count > 0)
                return galleryItems;

            var response = await httpClient.GetAsync("https://backend.headpat.de/api/galleries?populate=*&randomsort=true");



            if (response.IsSuccessStatusCode)
            {
                //TODO: Schöner machen
                var jsonString = await response.Content.ReadAsStringAsync();
                var jObj = JObject.Parse(jsonString);

                foreach (JObject obj in jObj["data"])
                {
                    var attr = obj["attributes"];

                    GalleryItem item = new()
                    {
                        Id = obj["id"].ToString(),
                        Name = attr["name"].ToString(),
                        IsNsfw = attr["nsfw"].ToObject<bool>(),
                        Created = attr["createdAt"].ToObject<DateTime>(),
                        ImageUrl = attr["img"]["data"]["attributes"]["url"].ToString(),
                        ThumbnailImageUrl = attr["img"]["data"]["attributes"]["formats"]["thumbnail"]["url"].ToString()
                    };

                    galleryItems.Add(item);
                }

            }


            return galleryItems;
        }
    }
}
