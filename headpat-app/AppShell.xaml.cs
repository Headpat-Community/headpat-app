using System.ComponentModel.Design;

namespace HeadpatCommunity.Mobile.HeadpatApp
{
    public partial class AppShell : Shell
    {
        public AppShell()
        {
            InitializeComponent();

            Routing.RegisterRoute(nameof(LoginPage), typeof(LoginPage));
            Routing.RegisterRoute(nameof(ProfilePage), typeof(ProfilePage));
            Routing.RegisterRoute(nameof(AnnouncementDetailsPage), typeof(AnnouncementDetailsPage));
            Routing.RegisterRoute(nameof(GalleryDetailsPage), typeof(GalleryDetailsPage));
        }
    }
}