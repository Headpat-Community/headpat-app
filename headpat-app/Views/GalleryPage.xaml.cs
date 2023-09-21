namespace HeadpatCommunity.HeadpatApp.Views;

public partial class GalleryPage : ContentPage
{
	public GalleryPage(GalleryViewModel viewModel)
	{
		InitializeComponent();
		BindingContext = viewModel;
		viewModel.GetItemsCommand.Execute(null);
	}
}