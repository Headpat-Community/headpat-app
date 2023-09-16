using Newtonsoft.Json.Linq;

namespace HeadpatCommunity.Mobile.HeadpatApp.Views;

public partial class ProfilePage : ContentPage
{
    public ProfilePage(ProfileViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}