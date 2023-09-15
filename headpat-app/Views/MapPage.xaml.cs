using Microsoft.Maui.Maps;

namespace HeadpatCommunity.Mobile.HeadpatApp.Views;

public partial class MapPage : ContentPage
{
	public MapPage()
	{
		InitializeComponent();

        //var pin = new CustomPin()
        //{
        //    Label = "veve",
        //    Location = new Location(0, 0),
        //    Address = "waawawawawa",
        //    ImageSource = ImageSource.FromUri(new Uri("https://cdn.discordapp.com/attachments/729429053941219480/1150123457141542982/1583572093.veve_alhpblsr-modified.png"))
        //};

        //headpatMap.Pins.Add(pin);
        
        headpatMap.MoveToRegion(new MapSpan(new Location(0, 0), 10, 15));
    }
}