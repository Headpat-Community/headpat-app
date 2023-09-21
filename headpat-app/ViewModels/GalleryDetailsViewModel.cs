using CommunityToolkit.Mvvm.ComponentModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.ViewModels
{
    [QueryProperty(nameof(GalleryItem), "GalleryItem")]
    public partial class GalleryDetailsViewModel : BaseViewModel
    {
        [ObservableProperty]
        GalleryItem _galleryItem;

        public GalleryDetailsViewModel()
        {
        }
    }
}