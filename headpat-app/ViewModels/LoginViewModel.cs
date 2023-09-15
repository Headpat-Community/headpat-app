using CommunityToolkit.Mvvm.ComponentModel;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.ViewModels
{
    public partial class LoginViewModel : BaseViewModel
    {
        AuthenticationService _service;
        IConnectivity _connectivity;

        [ObservableProperty]
        User user = new();

        public LoginViewModel(AuthenticationService service, IConnectivity connectivity)
        {
            Title = "Anmelden";
            _service = service;
            _connectivity = connectivity;
        }

        [RelayCommand]
        async Task PerformLogin()
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

                if (string.IsNullOrWhiteSpace(User.EMail) || string.IsNullOrWhiteSpace(User.Password))
                {
                    await Shell.Current.DisplayAlert("≧ ﹏ ≦", "Bitte gib deine E-Mail und dein Passwort ein!", "Ok");
                    return;
                }

                IsBusy = true;

                var result = await _service.LoginUserAsync(User.EMail, User.Password);

                await SecureStorage.SetAsync("AuthenticatedUser", result);
                await Shell.Current.GoToAsync("//Dashboard");
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                await Shell.Current.DisplayAlert("Fehler", "Anmeldung fehlgeschlagen :c", "Ok");
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
