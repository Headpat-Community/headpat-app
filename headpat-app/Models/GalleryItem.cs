namespace HeadpatCommunity.Mobile.HeadpatApp.Models
{
    public class GalleryItem
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public bool IsNsfw { get; set; }
        public bool IsNotNsfw => !IsNsfw; // Is Not Not Safe For Work :1lolol:
        public DateTime Created { get; set; }
        public string ImageUrl { get; set; }
        public string ThumbnailImageUrl { get; set; }
    }
}
