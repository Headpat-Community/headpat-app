using HeadpatCommunity.HeadpatApp.Services.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Services
{
    public class MapService : HttpService
    {
        List<PointsOfInterest> _pointsOfInterest = new();

        public MapService()
        {
        }

        public async Task<List<PointsOfInterest>> GetPointsOfInterestAsync()
        {
            if (_pointsOfInterest?.Count > 0)
                return _pointsOfInterest;

            var response = await Client.GetFromJsonAsync<ResponseList<PointsOfInterest>>(Endpoints.GET_POINTS_OF_INTEREST);

            if (response?.Data is null || response.Error is not null)
                throw new Exception($"Error while fetching points of interest.");

            _pointsOfInterest = response.Data;

            return _pointsOfInterest;
        }
    }
}
