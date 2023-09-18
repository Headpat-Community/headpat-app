using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Services
{
    public class GalleryService : BaseService
    {
        List<GalleryItem> _galleryItems = new();

        public GalleryService(GlobalUserService userService) : base(userService) { }

        public async Task<List<GalleryItem>> GetGalleryItemsAsync(bool isRefreshing = false)
        {
            if (_galleryItems?.Count > 0 && !isRefreshing)
                return _galleryItems;

            var response = await _client.GetFromJsonAsync<ResponseList<GalleryItem>>(Endpoints.GET_GALLERY);

            if (response?.Data is null || response.Error is not null)
                throw new Exception($"Error while fetching gallery items.");

            _galleryItems = response.Data;

            foreach (var galleryItem in _galleryItems)
            {
                galleryItem.Attributes.CreatedBy_UserData = await _userService.GetUserData(galleryItem.Attributes.CreatedBy.Data.Id);
                galleryItem.Attributes.CreatedBy = null;
            }

            _galleryItems.Shuffle();

            return _galleryItems;
        }
    }
}
