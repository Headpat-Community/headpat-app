namespace HeadpatCommunity.Mobile.HeadpatApp.Views;

public partial class LoginPage : ContentPage
{
	public LoginPage(LoginViewModel viewModel)
	{
		InitializeComponent();
        BindingContext = viewModel;
	}

    //protected override async void OnAppearing()
    //{
    //    if (await IsAuthenticated())
    //        await Shell.Current.GoToAsync($"{nameof(AnnouncementsPage)}");

    //    base.OnAppearing();
    //}

    //async Task<bool> IsAuthenticated()
    //{
    //    await Task.Delay(1000);
    //    return true;
    //}
}