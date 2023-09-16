using CommunityToolkit.Mvvm.ComponentModel;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.ViewModels
{
    public partial class AppShellViewModel : BaseViewModel
    {
#nullable enable
        [ObservableProperty]
        [NotifyPropertyChangedFor(nameof(IsAuthenticated))]
        User? authenticatedUser;

        public bool IsAuthenticated => authenticatedUser is not null;
#nullable disable

        public AppShellViewModel()
        {
        }

        [RelayCommand]
        async Task SetAuthenticatedUserFromStorageAsync()
        {
            AuthenticatedUser = await BaseService.GetAuthenticatedUser();
        }

        [RelayCommand]
        async Task SetAuthenticatedUserAsync(User authenticatedUser)
        {
            AuthenticatedUser = authenticatedUser;
        }
    }
}
