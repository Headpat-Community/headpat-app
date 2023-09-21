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
        [ObservableProperty]
        int _columnCount = 1;
        int _minImageWidth = 500;

        public GalleryViewModel(ResponseListService<GalleryItem> service, IConnectivity connectivity) :
            base(service, connectivity, Endpoints.GET_GALLERY, true)
        {
            Title = "Galerie";
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
        void SetDisplayColumns(double width)
        {
            ColumnCount = (int)Math.Ceiling(width / _minImageWidth);
        }

        [RelayCommand]
        void SetMaxImageHeight(double height)
        {

        }
    }
}
