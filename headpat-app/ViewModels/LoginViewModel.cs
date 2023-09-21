using CommunityToolkit.Mvvm.ComponentModel;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.ViewModels
{
    public partial class LoginViewModel : BaseViewModel
    {
        UserService _service;
        IConnectivity _connectivity;

        [ObservableProperty]
        UsersPermissionsUser _user = new();

        public LoginViewModel(UserService service, IConnectivity connectivity)
        {
            Title = "Login";
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

                if (string.IsNullOrWhiteSpace(User.Attributes.EMail) || string.IsNullOrWhiteSpace(User.Attributes.Password))
                {
                    await Shell.Current.DisplayAlert("Fehler", "Bitte gib deine E-Mail und dein Passwort ein!", "Ok");
                    return;
                }

                IsBusy = true;

                var userAuthStr = await _service.LoginUserAsync(User.Attributes.EMail, User.Attributes.Password);
                var userAuth = JsonSerializer.Deserialize<UserAuthentication>(userAuthStr);

                User.Id = userAuth.UserAttributes.Id;
                User.Attributes = userAuth.UserAttributes;

                await SecureStorage.SetAsync("AuthenticatedUser", userAuthStr);
                await Shell.Current.GoToAsync("..");
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
