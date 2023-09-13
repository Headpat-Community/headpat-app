using HeadpatCommunity.Mobile.HeadpatApp.Services;
using HeadpatCommunity.Mobile.HeadpatApp.ViewModels;
using HeadpatCommunity.Mobile.HeadpatApp.Views;
using Microsoft.Extensions.Logging;

namespace HeadpatCommunity.Mobile.HeadpatApp
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                    fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
                })
                .UseMauiMaps();

            builder.Services.AddSingleton<GalleryService>();

            builder.Services.AddSingleton<GalleryViewModel>();
            builder.Services.AddSingleton<GalleryPage>();

            builder.Services.AddTransient<GalleryDetailsViewModel>();
            builder.Services.AddTransient<GalleryDetailsPage>();

#if DEBUG
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}