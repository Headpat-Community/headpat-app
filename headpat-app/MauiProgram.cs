
//██╗░░██╗███████╗░█████╗░██████╗░██████╗░░█████╗░████████╗  ░░██╗██████╗░
//██║░░██║██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝  ░██╔╝╚════██╗
//███████║█████╗░░███████║██║░░██║██████╔╝███████║░░░██║░░░  ██╔╝░░█████╔╝
//██╔══██║██╔══╝░░██╔══██║██║░░██║██╔═══╝░██╔══██║░░░██║░░░  ╚██╗░░╚═══██╗
//██║░░██║███████╗██║░░██║██████╔╝██║░░░░░██║░░██║░░░██║░░░  ░╚██╗██████╔╝
//╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝╚═════╝░╚═╝░░░░░╚═╝░░╚═╝░░░╚═╝░░░  ░░╚═╝╚═════╝░

using Microsoft.Extensions.Logging;
using CommunityToolkit.Maui;

namespace HeadpatCommunity.HeadpatApp
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder.UseMauiApp<App>()
                .UseMauiCommunityToolkit()
                .UseMauiMaps()
                .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
            })
            .RegisterViewModels()
            .RegisterViews()
            .RegisterAppServices()
            .RegisterPlatformServices();

#if DEBUG
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}