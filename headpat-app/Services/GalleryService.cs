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
        HttpClient _httpClient;
        List<GalleryItem> galleryItems = new();

        public GalleryService()
        {
            _httpClient = new();
        }

        public async Task<List<GalleryItem>> GetGalleryItemsAsync(bool isRefreshing = false)
        {
            if (galleryItems?.Count > 0 && !isRefreshing)
                return galleryItems;

            var response = await _httpClient.GetAsync(Endpoints.GET_GALLERY);

            if (response.IsSuccessStatusCode)
            {
                var json = JObject.Parse(await response.Content.ReadAsStringAsync());
                galleryItems = JsonConvert.DeserializeObject<List<GalleryItem>>(json["data"].ToString());
                galleryItems.Shuffle();
            }
            else
                throw new Exception($"Error while fetching gallery items: {response.StatusCode}");

            return galleryItems;
        }
    }
}
