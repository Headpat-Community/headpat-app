using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HeadpatCommunity.HeadpatApp.Services.Base;

namespace HeadpatCommunity.HeadpatApp
{
    public static class Extensions
    {
        public static MauiAppBuilder RegisterViewModels(this MauiAppBuilder mauiAppBuilder)
        {
            mauiAppBuilder.Services.AddSingleton<ProfileViewModel>();
            mauiAppBuilder.Services.AddSingleton<AnnouncementsViewModel>();
            mauiAppBuilder.Services.AddSingleton<GalleryViewModel>();
            mauiAppBuilder.Services.AddSingleton<MapViewModel>();
            mauiAppBuilder.Services.AddTransient<LoginViewModel>();           
            mauiAppBuilder.Services.AddTransient<AnnouncementDetailsViewModel>();
            mauiAppBuilder.Services.AddTransient<GalleryDetailsViewModel>();

            return mauiAppBuilder;
        }

        public static MauiAppBuilder RegisterAppServices(this MauiAppBuilder mauiAppBuilder)
        {
            mauiAppBuilder.Services.AddSingleton<UserService>();

            mauiAppBuilder.Services.AddSingleton<ResponseListService<GalleryItem>>();
            mauiAppBuilder.Services.AddSingleton<ResponseListService<Announcement>>();

            mauiAppBuilder.Services.AddSingleton<ProfileService>();
            mauiAppBuilder.Services.AddSingleton<MapService>();
 
            return mauiAppBuilder;
        }

        public static MauiAppBuilder RegisterPlatformServices(this MauiAppBuilder mauiAppBuilder)
        {
            mauiAppBuilder.Services.AddSingleton<IConnectivity>(Connectivity.Current);

            return mauiAppBuilder;
        }

        public static MauiAppBuilder RegisterViews(this MauiAppBuilder mauiAppBuilder)
        {
            mauiAppBuilder.Services.AddSingleton<AnnouncementsPage>();
            mauiAppBuilder.Services.AddSingleton<GalleryPage>();
            mauiAppBuilder.Services.AddSingleton<MapPage>();
            mauiAppBuilder.Services.AddSingleton<ProfilePage>();

            mauiAppBuilder.Services.AddTransient<LoginPage>();
            mauiAppBuilder.Services.AddTransient<AnnouncementDetailsPage>();
            mauiAppBuilder.Services.AddTransient<GalleryDetailsPage>();

            return mauiAppBuilder;
        }

        public static void Shuffle<T>(this IList<T> list)
        {
            var rng = new Random();
            int n = list.Count;
            while (n > 1)
            {
                n--;
                int k = rng.Next(n + 1);
                T value = list[k];
                list[k] = list[n];
                list[n] = value;
            }
        }
    }
}
