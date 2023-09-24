using CommunityToolkit.Mvvm.ComponentModel;
using HeadpatCommunity.HeadpatApp.Services.Base;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.ViewModels
{
    public partial class GalleryViewModel : ResponseListViewModel<GalleryItem>
    {
        int minImageWidth = 500;
        int maxImageHeight = 400;

        [ObservableProperty]
        int _columnCount = 1;

        UserService _userService;

        public GalleryViewModel(ResponseListService<GalleryItem> service, IConnectivity connectivity, UserService userService) :
            base(service, connectivity, Endpoints.GET_GALLERY, true)
        {
            Title = "Galerie";
            _userService = userService;
        }

        protected override async Task<ResponseList<GalleryItem>> ModifyResponse(ResponseList<GalleryItem> responseList)
        {
            await _userService.AddToCache(responseList.Data.Select(x => x.Attributes.CreatedBy.Data.Id).Distinct().ToArray());
            responseList.Data.ForEach(x => x.Attributes.CreatedBy_UserData = _userService.CachedUserData[x.Attributes.CreatedBy.Data.Id]);
            return responseList;
        }

        [RelayCommand]
        async Task GoToDetailsAsync(GalleryItem item)
        {
            if (item is null)
                return;

            await Shell.Current.GoToAsync($"{nameof(GalleryDetailsPage)}", true,
                new Dictionary<string, object>
                {
                    {"GalleryItem", item }
                });
        }

        [RelayCommand]
        void SetLayout(Size size) //width, height
        {
            ColumnCount = (int)Math.Ceiling(size.Width / minImageWidth);
        }
    }
}
