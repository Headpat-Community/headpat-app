
//██╗░░██╗███████╗░█████╗░██████╗░██████╗░░█████╗░████████╗  ░░██╗██████╗░
//██║░░██║██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝  ░██╔╝╚════██╗
//███████║█████╗░░███████║██║░░██║██████╔╝███████║░░░██║░░░  ██╔╝░░█████╔╝
//██╔══██║██╔══╝░░██╔══██║██║░░██║██╔═══╝░██╔══██║░░░██║░░░  ╚██╗░░╚═══██╗
//██║░░██║███████╗██║░░██║██████╔╝██║░░░░░██║░░██║░░░██║░░░  ░╚██╗██████╔╝
//╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝╚═════╝░╚═╝░░░░░╚═╝░░╚═╝░░░╚═╝░░░  ░░╚═╝╚═════╝░

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

            builder.Services.AddSingleton<IConnectivity>(Connectivity.Current);

            builder.Services.AddSingleton<AuthenticationService>();
            builder.Services.AddTransient<LoginPage>();
            builder.Services.AddTransient<LoginViewModel>();

            builder.Services.AddSingleton<AnnouncementsService>();
            builder.Services.AddSingleton<AnnouncementsViewModel>();
            builder.Services.AddSingleton<AnnouncementsPage>();

            builder.Services.AddTransient<AnnouncementDetailsViewModel>();
            builder.Services.AddTransient<AnnouncementDetailsPage>();

            builder.Services.AddSingleton<GalleryService>();
            builder.Services.AddSingleton<GalleryViewModel>();
            builder.Services.AddSingleton<GalleryPage>();

            builder.Services.AddTransient<GalleryDetailsViewModel>();
            builder.Services.AddTransient<GalleryDetailsPage>();

            builder.Services.AddSingleton<MapPage>();

#if DEBUG
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}