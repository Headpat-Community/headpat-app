using HeadpatCommunity.Mobile.HeadpatApp.ViewModels;

namespace HeadpatCommunity.Mobile.HeadpatApp.Views;

public partial class GalleryDetailsPage : ContentPage
{
	public GalleryDetailsPage(GalleryDetailsViewModel viewModel)
	{
		InitializeComponent();
		BindingContext = viewModel;
	}
}