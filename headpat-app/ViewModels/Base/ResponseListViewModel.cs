using CommunityToolkit.Mvvm.ComponentModel;
using HeadpatCommunity.HeadpatApp.Services.Base;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.ViewModels.Base
{
    public partial class ResponseListViewModel<T> : BaseViewModel
    {
        public ResponseListService<T> Service { get; set; }
        public IConnectivity Connectivity { get; set; }
        bool _enablePaging;

        [ObservableProperty]
        bool _isRefreshing;

        public ObservableCollection<T> Items { get; } = new();

        int _itemLimit = 200;
        int _totalItems = -1;

        public ResponseListViewModel(ResponseListService<T> service, IConnectivity connectivity, string endpoint, bool enablePaging)
        {
            Service = service;
            Service.Endpoint = endpoint;
            Connectivity = connectivity;
            _enablePaging = enablePaging;
        }

        [RelayCommand]
        async Task GetItemsAsync()
        {
            if (IsBusy)
                return;

            try
            {
                ////////////////////////////////////////////////////// Prüfen ob Internetverbindung vorhanden
                if (Connectivity.NetworkAccess != NetworkAccess.Internet)
                {
                    await Shell.Current.DisplayAlert("Fehler", "Keine Internetverbindung :c", "Ok");
                    return;
                }

                IsBusy = true;

                ////////////////////////////////////////////////////// Refresh lädt Daten komplett neu -> StartIndex 0
                if (IsRefreshing && Items.Count > 0)
                    Items.Clear();

                ////////////////////////////////////////////////////// Prüfen ob weitere Items vorhanden
                if ((_enablePaging && _totalItems > -1 && Items.Count >= _totalItems) ||
                    (!_enablePaging && !IsRefreshing && Items.Count > 0))
                    return;

                ////////////////////////////////////////////////////// Daten laden
                var response = await Service.GetResponseListAsync(Items.Count, _itemLimit);

                _totalItems = response.Meta.Pagination.Total;
                
                foreach (var item in response.Data)
                    Items.Add(item);

            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                await Shell.Current.DisplayAlert("Fehler", $"Liste für {nameof(T)} konnte nicht geladen werden :c", "Ok");
            }
            finally
            {
                IsBusy = false;
                IsRefreshing = false;
            }
        }
    }
}
