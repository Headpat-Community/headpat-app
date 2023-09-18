using Microsoft.Maui.Controls.Maps;
using Microsoft.Maui.Maps;

namespace HeadpatCommunity.HeadpatApp.Views;

public partial class MapPage : ContentPage
{
    public MapPage(MapViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
        viewModel.GetPointsOfInterestCommand.Execute(null);

        foreach (var poi in viewModel.PointsOfInterest)
        {
            var polygon = new Polygon
            {
                StrokeWidth = 6,
                FillColor = Color.FromHex("#FF0000"),
            };

            foreach (var loc in poi.Attributes.LocationPoints.Data)
                polygon.Geopath.Add(new Location(poi.Attributes.Longitude, poi.Attributes.Longitude));

            headpatMap.MapElements.Add(polygon);
        }

        //headpatMap.MoveToRegion(MapSpan.FromCenterAndRadius(new Location(viewModel.PointsOfInterest[0].Attributes.Latitude, viewModel.PointsOfInterest[0].Attributes.Longitude), Distance.FromMiles(1)));
    }
}