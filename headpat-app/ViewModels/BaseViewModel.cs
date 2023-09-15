using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;

namespace HeadpatCommunity.Mobile.HeadpatApp.ViewModels
{
    public partial class BaseViewModel : ObservableObject
    {
        [ObservableProperty]
        string title;

        [ObservableProperty]
        [NotifyPropertyChangedFor(nameof(IsNotBusy))]
        bool isBusy;

        public bool IsNotBusy => !IsBusy;

        public BaseViewModel()
        {
        }

        [RelayCommand]
        async Task PerformLogout()
        {
            SecureStorage.RemoveAll();
            await Shell.Current.GoToAsync("//Login");
        }
    }
}
