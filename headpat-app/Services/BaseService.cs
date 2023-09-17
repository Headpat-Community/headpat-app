using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Services
{
    public abstract class BaseService
    {
        protected HttpClient _httpClient;

        public BaseService()
        {
            _httpClient = new();
        }
    }
}
