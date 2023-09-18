using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Services
{
    public abstract class BaseService
    {
        protected HttpClient _client = new();
        protected GlobalUserService _userService;

        public BaseService(GlobalUserService userService)
        {
            _userService = userService;
        }

        public BaseService() { }
    }
}
