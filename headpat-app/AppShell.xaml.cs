using System.ComponentModel.Design;

namespace HeadpatCommunity.Mobile.HeadpatApp
{
    public partial class AppShell : Shell
    {
        public AppShell(AppShellViewModel viewModel)
        {
            InitializeComponent();
            BindingContext = viewModel;

            Routing.RegisterRoute(nameof(LoginPage), typeof(LoginPage));
            Routing.RegisterRoute(nameof(ProfilePage), typeof(ProfilePage));
            Routing.RegisterRoute(nameof(AnnouncementDetailsPage), typeof(AnnouncementDetailsPage));
            Routing.RegisterRoute(nameof(GalleryDetailsPage), typeof(GalleryDetailsPage));
        }
    }
}