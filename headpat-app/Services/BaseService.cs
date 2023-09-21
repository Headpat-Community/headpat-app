using Android.SE.Omapi;
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
        protected UserService _userService;

        public BaseService(UserService userService)
        {
            _userService = userService;
        }

        public BaseService() { }
    }
}
