namespace HeadpatCommunity.HeadpatApp.Views;

public partial class GalleryDetailsPage : ContentPage
{
	public GalleryDetailsPage(GalleryDetailsViewModel viewModel)
	{
		InitializeComponent();
		BindingContext = viewModel;
	}
}