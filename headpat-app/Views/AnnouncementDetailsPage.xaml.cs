namespace HeadpatCommunity.Mobile.HeadpatApp.Views;

public partial class AnnouncementDetailsPage : ContentPage
{
	public AnnouncementDetailsPage(AnnouncementDetailsViewModel viewModel)
	{
		InitializeComponent();
		BindingContext = viewModel;
	}
}