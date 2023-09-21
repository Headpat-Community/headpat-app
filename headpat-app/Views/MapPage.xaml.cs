using Microsoft.Maui.Controls.Maps;
using Microsoft.Maui.Devices.Sensors;
using Microsoft.Maui.Maps;

namespace HeadpatCommunity.HeadpatApp.Views;

public partial class MapPage : ContentPage
{
    public MapPage(MapViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;

        //foreach (var element in viewModel.GetPointsOfInterest().Result)
        //    headpatMap.MapElements.Add(element);
    }
}