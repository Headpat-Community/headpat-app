﻿using System.ComponentModel.Design;

namespace HeadpatCommunity.Mobile.HeadpatApp
{
    public partial class AppShell : Shell
    {
        public AppShell()
        {
            InitializeComponent();

            Routing.RegisterRoute(nameof(AnnouncementDetailsPage), typeof(AnnouncementDetailsPage));
            Routing.RegisterRoute(nameof(GalleryDetailsPage), typeof(GalleryDetailsPage));
            
            var authToken = SecureStorage.GetAsync("AuthToken").Result;

            //TODO: Prüfen ob Authentication gültig

            if (authToken is not null)
                MainShell.CurrentItem = Dashboard;
            else
                MainShell.CurrentItem = Login;
        }
    }
}