using CommunityToolkit.Mvvm.ComponentModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.ViewModels
{
    public partial class LoginViewModel : BaseViewModel
    {
        [ObservableProperty]
        User user = new();

        public LoginViewModel()
        {
            Title = "Anmelden";
        }

        [RelayCommand]
        async Task PerformLogin()
        {
            var data = User;

            await SecureStorage.SetAsync("AuthToken", "1234567890");
            await Shell.Current.GoToAsync("//Dashboard");
        }
    }
}
