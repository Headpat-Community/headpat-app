using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Services.Base
{
    public abstract class HttpService
    {
        protected HttpClient Client { get; set; }

        public HttpService()
        {
            Client = new();
        }
    }
}
