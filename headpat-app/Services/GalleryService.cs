﻿using Newtonsoft.Json;
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

                galleryItems = JsonConvert.DeserializeObject<List<GalleryItem>>(jObj["data"].ToString());
            }
            else
                throw new Exception($"Error while fetching gallery items: {response.StatusCode}");

            return galleryItems;
        }
    }
}
