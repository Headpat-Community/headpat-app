
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
                .UseMauiMaps()
                .RegisterViewModels()
                .RegisterViews()
                .RegisterAppServices();

            builder.Services.AddSingleton<IConnectivity>(Connectivity.Current);

#if DEBUG
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}