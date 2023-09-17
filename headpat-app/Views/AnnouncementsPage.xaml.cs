namespace HeadpatCommunity.HeadpatApp.Views;

public partial class AnnouncementsPage : ContentPage
{
	public AnnouncementsPage(AnnouncementsViewModel viewModel)
	{
		InitializeComponent();
		BindingContext = viewModel;
		viewModel.GetAnnouncementsCommand.Execute(null);
    }
}