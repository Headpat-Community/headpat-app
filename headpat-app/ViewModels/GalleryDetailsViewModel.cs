using CommunityToolkit.Mvvm.ComponentModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.ViewModels
{
    [QueryProperty("GalleryItem", "GalleryItem")]
    public partial class GalleryDetailsViewModel : BaseViewModel
    {
        [ObservableProperty]
        GalleryItem galleryItem;

        public GalleryDetailsViewModel()
        {
        }
    }
}
