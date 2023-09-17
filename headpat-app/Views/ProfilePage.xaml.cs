using Newtonsoft.Json.Linq;

namespace HeadpatCommunity.HeadpatApp.Views;

public partial class ProfilePage : ContentPage
{
    public ProfilePage(ProfileViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}