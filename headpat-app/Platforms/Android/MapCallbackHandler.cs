using Android.Gms.Maps;
using Microsoft.Maui.Maps;
using Microsoft.Maui.Maps.Handlers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IMap = Microsoft.Maui.Maps.IMap;

namespace HeadpatCommunity.Mobile.HeadpatApp.Platforms.Android
{
    class MapCallbackHandler : Java.Lang.Object, IOnMapReadyCallback
    {
        private readonly IMapHandler mapHandler;

        public MapCallbackHandler(IMapHandler mapHandler)
        {
            this.mapHandler = mapHandler;
        }

        public void OnMapReady(GoogleMap googleMap)
        {
            mapHandler.UpdateValue(nameof(IMap.Pins));
        }
    }

}
