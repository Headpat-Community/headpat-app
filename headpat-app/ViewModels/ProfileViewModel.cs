using CommunityToolkit.Mvvm.ComponentModel;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.ViewModels
{
    [QueryProperty(nameof(UserData), "UserData")]
    public partial class ProfileViewModel : BaseViewModel
    {
        ProfileService _service;
        IConnectivity _connectivity;

#nullable enable
        [ObservableProperty]
        UserData? _userData;
#nullable disable

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

            if (UserData is not null) {
                OnPropertyChanged(nameof(UserData)); //Bugfix: https://github.com/dotnet/maui/issues/14205
                return;
            }

            IsBusy = true;

            try
            {
                UserData = await _service.GetAuthenticatedUserData();

                if (UserData is null)
                    await Shell.Current.GoToAsync(nameof(LoginPage));
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

            UserData = null;

            await Shell.Current.GoToAsync("//Announcements");
        }
    }
}
