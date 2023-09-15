using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp.Services
{
    public class AuthenticationService
    {
        HttpClient _httpClient;

        public AuthenticationService()
        {
            _httpClient = new();
        }

        public async Task<string> LoginUserAsync(string eMail, string password)
        {
            Dictionary<string, string> values = new()
            {
                { "identifier", eMail },
                { "password", password }
            };

            FormUrlEncodedContent content = new(values);

            var response = await _httpClient.PostAsync(Endpoints.LOGIN_USER, content);

            if (response.IsSuccessStatusCode)
                return await response.Content.ReadAsStringAsync();
            else
                throw new Exception($"Error while logging in: {response.StatusCode}");
        }
    }
}
