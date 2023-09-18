using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Services
{
    public class ProfileService : BaseService
    {
        UserData _userData = new();

        public ProfileService(GlobalUserService userService) : base(userService)
        {
        }

        public async Task<UserData> GetProfileAsync(int id)
        {
            if (_userData?.Id != null && _userData.Id == id)
                return _userData;

            _userData = await _userService.GetUserData(id);

            return _userData;
        }

#nullable enable
        public async Task<UserData?> GetAuthenticatedUserData()
        {
            var authJson = await SecureStorage.GetAsync("AuthenticatedUser");

            if (authJson is null)
                return null;

            var authUser = JsonSerializer.Deserialize<UserAuthentication>(authJson);

            if (authUser is null)
                return null;

            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(authUser.Jwt);

            if (jwt.ValidTo < DateTime.UtcNow)
                return null;

            return await _userService.GetUserData(authUser.UserAttributes.Id);
        }
#nullable disable
    }
}
