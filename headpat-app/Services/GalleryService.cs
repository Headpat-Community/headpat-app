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

        public async Task<List<GalleryItem>> GetGalleryItemsAsync(int startIndex, int amount, bool isRefreshing = false)
        {
            //if (_galleryItems?.Count > 0 && !isRefreshing)
            //    return _galleryItems;

            var response = await _client.GetFromJsonAsync<ResponseList<GalleryItem>>($"{Endpoints.GET_GALLERY}{string.Format(Endpoints.PAGINATION, startIndex, amount)}");

            if (response?.Data is null || response.Error is not null)
                throw new Exception($"Error while fetching gallery items.");

            _galleryItems = response.Data;

            await _userService.AddToCache(_galleryItems.Select(x => x.Attributes.CreatedBy.Data.Id).Distinct().ToArray());

            _galleryItems.ToList()
                .ForEach(x => x.Attributes.CreatedBy_UserData = _userService.CachedUserData[x.Attributes.CreatedBy.Data.Id]);

            //_galleryItems.Shuffle();

            return _galleryItems;
        }
    }
}
