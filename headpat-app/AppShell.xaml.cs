using System.ComponentModel.Design;

namespace HeadpatCommunity.Mobile.HeadpatApp
{
    public partial class AppShell : Shell
    {
        public AppShell()
        {
            InitializeComponent();

            Routing.RegisterRoute(nameof(GalleryDetailsPage), typeof(GalleryDetailsPage));

            var authToken = SecureStorage.GetAsync("AuthToken").Result;

            if (authToken is not null)
                MainShell.CurrentItem = Dashboard;
            else
                MainShell.CurrentItem = Login;
        }
    }
}