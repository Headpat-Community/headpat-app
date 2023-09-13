namespace HeadpatCommunity.Mobile.HeadpatApp
{
    public partial class AppShell : Shell
    {
        public AppShell()
        {
            InitializeComponent();

            Routing.RegisterRoute(nameof(GalleryDetailsPage), typeof(GalleryDetailsPage));
        }
    }
}