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
        async Task GetProfileAsync()
        {
            if (IsBusy)
                return;

            if (Profile is not null)
                return;

            IsBusy = true;

            try
            {
                var user = await _service.GetAuthenticatedUser();

                if (user is null)
                {
                    await Shell.Current.GoToAsync(nameof(LoginPage));
                    return;
                }

                Profile = await _service.GetProfileAsync(user.Id);
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
        async Task PerformLogout()
        {
            if (IsBusy)
                return;

            SecureStorage.RemoveAll();

            Profile = null;

            await Shell.Current.GoToAsync("//Announcements");
        }
    }
}
