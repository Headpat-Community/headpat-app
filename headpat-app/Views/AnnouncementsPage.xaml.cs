namespace HeadpatCommunity.Mobile.HeadpatApp.Views;

public partial class AnnouncementsPage : ContentPage
{
	public AnnouncementsPage(AnnouncementsViewModel viewModel)
	{
		InitializeComponent();
		BindingContext = viewModel;
    }

	protected override void OnAppearing()
	{
        base.OnAppearing();
		(BindingContext as AnnouncementsViewModel).GetAnnouncementsCommand.Execute(null);
    }
}