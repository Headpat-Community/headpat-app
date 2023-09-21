
//██╗░░██╗███████╗░█████╗░██████╗░██████╗░░█████╗░████████╗  ░░██╗██████╗░
//██║░░██║██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝  ░██╔╝╚════██╗
//███████║█████╗░░███████║██║░░██║██████╔╝███████║░░░██║░░░  ██╔╝░░█████╔╝
//██╔══██║██╔══╝░░██╔══██║██║░░██║██╔═══╝░██╔══██║░░░██║░░░  ╚██╗░░╚═══██╗
//██║░░██║███████╗██║░░██║██████╔╝██║░░░░░██║░░██║░░░██║░░░  ░╚██╗██████╔╝
//╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝╚═════╝░╚═╝░░░░░╚═╝░░╚═╝░░░╚═╝░░░  ░░╚═╝╚═════╝░

using Microsoft.Maui.Handlers;
using Microsoft.Maui.Platform;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Maui;
using FFImageLoading.Maui;

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
                .UseFFImageLoading()
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


#if __ANDROID__
            ImageHandler.Mapper.PrependToMapping(nameof(Microsoft.Maui.IImage.Source), (handler, view) => PrependToMappingImageSource(handler, view));
#endif

            return builder.Build();
        }


#if __ANDROID__
        public static void PrependToMappingImageSource(IImageHandler handler, Microsoft.Maui.IImage image)
        {
            handler.PlatformView?.Clear();
        }
#endif
    }
}