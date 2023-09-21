namespace HeadpatCommunity.HeadpatApp
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

        //protected override void OnNavigating(ShellNavigatingEventArgs args)
        //{
        //    base.OnNavigating(args);

        //    if (args.Source != ShellNavigationSource.ShellSectionChanged)
        //        return;

        //    var navigation = Shell.Current.Navigation;
        //    var pages = navigation.NavigationStack;

        //    for (var i = pages.Count - 1; i >= 1; i--)
        //        navigation.RemovePage(pages[i]);
        //}
    }
}
