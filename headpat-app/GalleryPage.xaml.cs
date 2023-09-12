using HeadpatCommunity.Mobile.HeadpatApp.ViewModels;

namespace HeadpatCommunity.Mobile.HeadpatApp.Views;

public partial class GalleryPage : ContentPage
{
	public GalleryPage(GalleryViewModel viewModel)
	{
		InitializeComponent();
		BindingContext = viewModel;
	}
}