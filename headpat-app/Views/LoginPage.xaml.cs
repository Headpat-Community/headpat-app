namespace HeadpatCommunity.Mobile.HeadpatApp.Views;

public partial class LoginPage : ContentPage
{
	public LoginPage(LoginViewModel viewModel)
	{
		InitializeComponent();
        BindingContext = viewModel;
	}
}