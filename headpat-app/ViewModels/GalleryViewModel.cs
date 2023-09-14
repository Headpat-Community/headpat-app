using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using CommunityToolkit.Mvvm.ComponentModel;

namespace HeadpatCommunity.Mobile.HeadpatApp.ViewModels
{
    public partial class GalleryViewModel : BaseViewModel
    {
        GalleryService _service;
        IConnectivity _connectivity;

        [ObservableProperty]
        bool isRefreshing;

        public ObservableCollection<GalleryItem> GalleryItems { get; } = new();

        public GalleryViewModel(GalleryService service, IConnectivity connectivity)
        {
            Title = "Gallery";
            _service = service;
            _connectivity = connectivity;
        }

        [RelayCommand]
        async Task GetGalleryItemsAsync()
        {
            if (IsBusy)
                return;

            try
            {
                if (_connectivity.NetworkAccess != NetworkAccess.Internet)
                {
                    await Shell.Current.DisplayAlert("Fehler", "Keine Internetverbindung :c", "Ok");
                    return;
                }

                IsBusy = true;

                var items = await _service.GetGalleryItemsAsync();

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
                IsRefreshing = false;
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
