using CommunityToolkit.Mvvm.ComponentModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.ViewModels
{
    [QueryProperty(nameof(Announcement), "Announcement")]
    public partial class AnnouncementDetailsViewModel : BaseViewModel
    {
        [ObservableProperty]
        Announcement _announcement;

        public AnnouncementDetailsViewModel()
        {
            Title = "Ankündigung";
        }
    }
}
