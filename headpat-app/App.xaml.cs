

namespace HeadpatCommunity.Mobile.HeadpatApp
{
    public partial class App : Application
    {
        AppShellViewModel _appShellViewModel;

        public App(AppShellViewModel viewModel)
        {
            InitializeComponent();
            _appShellViewModel = viewModel;
            MainPage = new AppShell(_appShellViewModel);
        }

        protected override Window CreateWindow(IActivationState activationState)
        {
            var window = base.CreateWindow(activationState);

            window.Activated += (s, e) =>
            {
                _appShellViewModel.SetAuthenticatedUserFromStorageCommand.Execute(null);
            };

            return window;
        }
    }
}