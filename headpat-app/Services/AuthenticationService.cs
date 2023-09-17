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
    public class AuthenticationService : BaseService
    {
        public async Task<string> LoginUserAsync(string eMail, string password)
        {
            _httpClient.DefaultRequestHeaders.Authorization = null;

            Dictionary<string, string> values = new()
            {
                { "identifier", eMail },
                { "password", password }
            };

            FormUrlEncodedContent content = new(values);

            var response = await _httpClient.PostAsync(Endpoints.LOGIN_USER, content);

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Error while logging in: {response.StatusCode}");

            return await response.Content.ReadAsStringAsync();
        }
    }
}
