using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;

namespace HeadpatCommunity.HeadpatApp.ViewModels
{
    public partial class BaseViewModel : ObservableObject
    {
        [ObservableProperty]
        string _title;

        [ObservableProperty]
        [NotifyPropertyChangedFor(nameof(IsNotBusy))]
        bool _isBusy;

        public bool IsNotBusy => !IsBusy;

        public BaseViewModel()
        {
        }

        [RelayCommand]
        async Task GoToProfileAsync(UserData userData)
        {
            if (userData is null)
                return;
                       

            await Shell.Current.GoToAsync($"{nameof(ProfilePage)}", true,
                new Dictionary<string, object>
                {
                    {"UserData", userData }
                });
        }
    }
}
