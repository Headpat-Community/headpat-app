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
        AuthenticationService _service;


        public AppShellViewModel(AuthenticationService service)
        {
            _service = service;
        }

        [RelayCommand]
        async Task GoToProfileAsync()
        {
           var userData = await SecureStorage.GetAsync("AuthenticatedUser");

            if (userData is null)
            {
                await Shell.Current.GoToAsync(nameof(LoginPage));
                return;
            }

            var json = JObject.Parse(userData);
            var tokenValid = await _service.ValidateTokenAsync(json["jwt"].ToString());

            if (tokenValid)
            {
                
                await Shell.Current.GoToAsync(nameof(LoginPage));
                return;
            }

            await Shell.Current.GoToAsync(nameof(ProfilePage));
        }

        [RelayCommand]
        async Task PerformLogoutAsync()
        {
            SecureStorage.RemoveAll();
            await Shell.Current.GoToAsync("//Login");
        }
    }
}
