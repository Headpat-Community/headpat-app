using CommunityToolkit.Mvvm.ComponentModel;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.ViewModels
{
    [QueryProperty(nameof(Announcements), "Announcement")]
    public partial class AnnouncementsViewModel : BaseViewModel
    {
        AnnouncementsService _service;
        IConnectivity _connectivity;

        [ObservableProperty]
        bool isRefreshing;

        public ObservableCollection<Announcement> Announcements { get; } = new();

        public AnnouncementsViewModel(AnnouncementsService service, IConnectivity connectivity)
        {
            Title = "Announcements";
            _service = service;
            _connectivity = connectivity;
        }

        [RelayCommand]
        async Task GetAnnouncementsAsync()
        {
            if (IsBusy)
                return;

            try
            {
                if (_connectivity.NetworkAccess != NetworkAccess.Internet)
                {
                    await Shell.Current.DisplayAlert("≧ ﹏ ≦", "Keine Internetverbindung!", "Ok");
                    return;
                }

                IsBusy = true;

                var items = await _service.GetAnnouncements(IsRefreshing);

                if (items?.Count > 0)
                    Announcements.Clear();

                foreach (var item in items)
                    Announcements.Add(item);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                await Shell.Current.DisplayAlert("Fehler", $"Announcements konnten nicht geladen werden :c", "Ok");
            }
            finally
            {
                IsBusy = false;
                IsRefreshing = false;
            }
        }

        [RelayCommand]
        async Task GoToDetailsAsync(Announcement item)
        {
            if (item is null)
                return;

            await Shell.Current.GoToAsync($"{nameof(AnnouncementDetailsPage)}", true,
                new Dictionary<string, object>
                {
                    {"Announcement", item }
                });
        }
    }
}
