using CommunityToolkit.Mvvm.ComponentModel;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.ViewModels
{
    [QueryProperty(nameof(Profile), "Profile")]
    public partial class ProfileViewModel : BaseViewModel
    {
        ProfileService _service;
        IConnectivity _connectivity;

        [ObservableProperty]
        Profile profile;

        public ProfileViewModel(ProfileService service, IConnectivity connectivity)
        {
            Title = "Profil";
            _service = service;
            _connectivity = connectivity;
        }

        [RelayCommand]
        async Task GetProfileDataAsync(int id)
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
                Profile = await _service.GetProfileAsync(id);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                await Shell.Current.DisplayAlert("Fehler", "Profil konnte nicht geladen werden :c", "Ok");
            }
            finally
            {
                IsBusy = false;
            }
        }

        [RelayCommand]
        async Task CheckProfileAsync(bool isAuthenticated)
        {
            if (Profile is null)
                await Shell.Current.GoToAsync(nameof(LoginPage));
        }
    }
}
