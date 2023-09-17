namespace HeadpatCommunity.HeadpatApp.Views;

public partial class AnnouncementDetailsPage : ContentPage
{
	public AnnouncementDetailsPage(AnnouncementDetailsViewModel viewModel)
	{
		InitializeComponent();
		BindingContext = viewModel;
	}
}