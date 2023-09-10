using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.Models
{
    class HeadpatItem
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Info { get; set; }
        public double Latitude { get; set; }
        public double Longitute { get; set; }

    }
}
