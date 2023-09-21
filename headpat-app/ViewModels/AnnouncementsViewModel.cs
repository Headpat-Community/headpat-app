using CommunityToolkit.Mvvm.ComponentModel;
using HeadpatCommunity.HeadpatApp.Services.Base;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.ViewModels
{
    public partial class AnnouncementsViewModel : ResponseListViewModel<Announcement>
    {
        public AnnouncementsViewModel(ResponseListService<Announcement> service, IConnectivity connectivity) :
            base(service, connectivity, Endpoints.GET_ANNOUNCEMENTS, true)
        {
            Title = "Ankündigungen";
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
