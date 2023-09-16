namespace HeadpatCommunity.Mobile.HeadpatApp
{
    public partial class App : Application
    {
        public App(AppShellViewModel viewModel)
        {
            InitializeComponent();

            MainPage = new AppShell(viewModel);
        }
    }
}