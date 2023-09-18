using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Services
{
    public class MapService : BaseService
    {
        List<PointsOfInterest> _pointsOfInterest = new();

        public MapService(GlobalUserService userService) : base(userService)
        {
        }

        public async Task<List<PointsOfInterest>> GetPointsOfInterestAsync()
        {
            if (_pointsOfInterest?.Count > 0)
                return _pointsOfInterest;

            var response = await _client.GetFromJsonAsync<ResponseList<PointsOfInterest>>(Endpoints.GET_POINTS_OF_INTEREST);

            if (response?.Data is null || response.Error is not null)
                throw new Exception($"Error while fetching points of interest.");

            _pointsOfInterest = response.Data;

            return _pointsOfInterest;
        }
    }
}
