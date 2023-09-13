using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using HeadpatCommunity.Mobile.HeadpatApp.Services;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using CommunityToolkit.Mvvm.Input;
using HeadpatCommunity.Mobile.HeadpatApp.Views;

namespace HeadpatCommunity.Mobile.HeadpatApp.ViewModels
{
    public partial class GalleryViewModel : BaseViewModel
    {
        GalleryService _service;
        public ObservableCollection<GalleryItem> GalleryItems { get; } = new();

        public GalleryViewModel(GalleryService service)
        {
            Title = "Gallery";
            _service = service;
        }

        [RelayCommand]
        async Task GetGalleryItemsAsync()
        {
            if (IsBusy)
                return;

            try
            {
                IsBusy = true;

                var items = await _service.GetGalleryItems();

                if (items?.Count > 0)
                    GalleryItems.Clear();

                foreach (var item in items)
                    GalleryItems.Add(item);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                await Shell.Current.DisplayAlert("Fehler", $"Gallerie konnte nicht geladen werden :c", "Ok");
            }
            finally
            {
                IsBusy = false;
            }
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
    }
}
