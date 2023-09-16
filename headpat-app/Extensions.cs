﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp
{
    public static class Extensions
    {
        public static MauiAppBuilder RegisterViewModels(this MauiAppBuilder mauiAppBuilder)
        {
            mauiAppBuilder.Services.AddSingleton<AppShellViewModel>();
            mauiAppBuilder.Services.AddTransient<LoginViewModel>();
            mauiAppBuilder.Services.AddSingleton<AnnouncementsViewModel>();
            mauiAppBuilder.Services.AddTransient<AnnouncementDetailsViewModel>();
            mauiAppBuilder.Services.AddSingleton<GalleryViewModel>();
            mauiAppBuilder.Services.AddTransient<GalleryDetailsViewModel>();
            return mauiAppBuilder;
        }

        public static MauiAppBuilder RegisterAppServices(this MauiAppBuilder mauiAppBuilder)
        {
            mauiAppBuilder.Services.AddSingleton<AuthenticationService>();
            mauiAppBuilder.Services.AddSingleton<AnnouncementsService>();
            mauiAppBuilder.Services.AddSingleton<GalleryService>();
            return mauiAppBuilder;
        }

        public static MauiAppBuilder RegisterViews(this MauiAppBuilder mauiAppBuilder)
        {
            mauiAppBuilder.Services.AddTransient<LoginPage>();
            mauiAppBuilder.Services.AddSingleton<AnnouncementsPage>();
            mauiAppBuilder.Services.AddTransient<AnnouncementDetailsPage>();
            mauiAppBuilder.Services.AddSingleton<GalleryPage>();
            mauiAppBuilder.Services.AddTransient<GalleryDetailsPage>();
            mauiAppBuilder.Services.AddSingleton<MapPage>();
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