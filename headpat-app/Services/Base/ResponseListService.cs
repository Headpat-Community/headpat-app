using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Services.Base
{
    public class ResponseListService<T> : HttpService
    {
        public string Endpoint { get; set; }

        ResponseList<T> _responseList;

        public ResponseListService()
        {
        }

        public async Task<ResponseList<T>> GetResponseListAsync()
        {
            return await GetResponseListAsync(Endpoint);
        }

        public async Task<ResponseList<T>> GetResponseListAsync(int startIndex, int itemLimit)
        {
            if (_responseList?.Meta?.Pagination is not null &&
                startIndex >= _responseList.Meta.Pagination.Total)
                return _responseList;

            return await GetResponseListAsync($"{Endpoint}{string.Format(Endpoints.PAGINATION, startIndex, itemLimit)}");
        }

        async Task<ResponseList<T>> GetResponseListAsync(string endpoint)
        {
            var response = await Client.GetFromJsonAsync<ResponseList<T>>(endpoint);

            if (response?.Data == null || response?.Error is not null)
                throw new Exception($"Error while fetching response list for type {nameof(T)}.");

            _responseList = response;

            return _responseList;
        }
    }
}
