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
                        Description = attr["longtext"].ToString(),
                        AlternativeText = attr["imgalt"].ToString(),
                        IsNsfw = attr["nsfw"].ToObject<bool>(),
                        Created = attr["createdAt"].ToObject<DateTime>(),
                        ImageUrl = attr["img"]["data"]["attributes"]["url"].ToString(),
                        ThumbnailImageUrl = attr["img"]["data"]["attributes"]["formats"]["thumbnail"]?["url"]?.ToString(),
                        SmallImageUrl = attr["img"]["data"]["attributes"]["formats"]["small"]?["url"]?.ToString(),
                        Username = attr["users_permissions_user"]["data"]["attributes"]["username"].ToString()
                    };

                    if (item.ImageUrl.EndsWith(".gif"))
                    {
                        item.ThumbnailImageUrl = item.ImageUrl;
                        item.SmallImageUrl = item.ImageUrl;
                    }

                    if (item.ThumbnailImageUrl is null)
                        item.ThumbnailImageUrl = item.ImageUrl;

                    if (item.SmallImageUrl is null)
                        item.SmallImageUrl = item.ImageUrl;

                    galleryItems.Add(item);
                }
            }
            else
                throw new Exception($"Error while fetching gallery items: {response.StatusCode}");

            return galleryItems;
        }
    }
}
