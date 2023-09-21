using CommunityToolkit.Mvvm.ComponentModel;
using HeadpatCommunity.HeadpatApp.Services.Base;
using Microsoft.Maui.Controls.Maps;
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
    public partial class MapViewModel : ResponseListViewModel<PointsOfInterest>
    {
        public MapViewModel(ResponseListService<PointsOfInterest> service, IConnectivity connectivity) :
            base(service, connectivity, Endpoints.GET_POINTS_OF_INTEREST, false)
        {
            Title = "Map";
        }

        public async Task<List<MapElement>> GetPointsOfInterest()
        {
            List<MapElement> mapElements = new();

            try
            {
                if (Connectivity.NetworkAccess != NetworkAccess.Internet)
                    await Shell.Current.DisplayAlert("Fehler", "Keine Internetverbindung :c", "Ok");
                else
                {
                    IsBusy = true;
                    var pointsOfInterest = await Service.GetResponseListAsync();

                    foreach (var poi in pointsOfInterest.Data)
                    {
                        var polyline = new Polyline
                        {
                            StrokeColor = Color.FromArgb("#ff0000"),
                            StrokeWidth = 5,
                        };

                        foreach (var point in poi.Attributes.LocationPoints.Data)
                            polyline.Geopath.Add(new Location(point.Attributes.Latitude, point.Attributes.Longitude));

                        mapElements.Add(polyline);
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                await Shell.Current.DisplayAlert("Fehler", "Map konnte nicht geladen werden :c", "Ok");
            }
            finally
            {
            }

            return mapElements;
        }
    }
}
