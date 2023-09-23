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
        UserService _userService;

        public AnnouncementsViewModel(ResponseListService<Announcement> service, IConnectivity connectivity, UserService userService) :
            base(service, connectivity, Endpoints.GET_ANNOUNCEMENTS, true)
        {
            Title = "Ankündigungen";
            _userService = userService;
        }

        protected override async Task<ResponseList<Announcement>> ModifyResponse(ResponseList<Announcement> responseList)
        {
            await _userService.AddToCache(responseList.Data.Select(x => x.Attributes.CreatedBy.Data.Id).Distinct().ToArray());
            responseList.Data.ForEach(x => x.Attributes.CreatedBy_UserData = _userService.CachedUserData[x.Attributes.CreatedBy.Data.Id]);
            return responseList;
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
