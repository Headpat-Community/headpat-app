using CommunityToolkit.Mvvm.ComponentModel;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.ViewModels
{


    public partial class MapViewModel : BaseViewModel
    {
        MapService _service;
        IConnectivity _connectivity;

        public ObservableCollection<PointsOfInterest> PointsOfInterest { get; } = new();

        public MapViewModel(MapService service, IConnectivity connectivity)
        {
            Title = "Headpat Map";
            _service = service;
            _connectivity = connectivity;
        }

        [RelayCommand]
        async Task GetPointsOfInterest()
        {
            IsBusy = false;

            try
            {
                if (_connectivity.NetworkAccess != NetworkAccess.Internet)
                {
                    await Shell.Current.DisplayAlert("Fehler", "Keine Internetverbindung :c", "Ok");
                    return;
                }

                IsBusy = true;

                var pointsOfInterests = await _service.GetPointsOfInterestAsync();

                if (pointsOfInterests?.Count > 0)
                    PointsOfInterest.Clear();

                foreach (var pointsOfInterest in pointsOfInterests)
                    PointsOfInterest.Add(pointsOfInterest);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                await Shell.Current.DisplayAlert("Fehler", "Map konnte nicht geladen werden :c", "Ok");
            }
            finally
            {
                IsBusy = false;
            }   
        }
    }
}
