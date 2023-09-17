using CommunityToolkit.Mvvm.ComponentModel;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.ViewModels
{
    public partial class LoginViewModel : BaseViewModel
    {
        AuthenticationService _service;
        IConnectivity _connectivity;

        [ObservableProperty]
        User _user = new();

        public LoginViewModel(AuthenticationService service, IConnectivity connectivity)
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

                if (string.IsNullOrWhiteSpace(User.EMail) || string.IsNullOrWhiteSpace(User.Password))
                {
                    await Shell.Current.DisplayAlert("Fehler", "Bitte gib deine E-Mail und dein Passwort ein!", "Ok");
                    return;
                }

                IsBusy = true;

                var json = JObject.Parse(await _service.LoginUserAsync(User.EMail, User.Password));
                
                User = JsonConvert.DeserializeObject<User>(json["user"].ToString());

                await SecureStorage.SetAsync("AuthenticatedUser", json.ToString());

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
