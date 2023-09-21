using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp
{
    public static class Endpoints
    {
        public const string API_URL = "https://backend.headpat.de/api";

        public const string GET_GALLERY = "https://backend.headpat.de/api/galleries?populate=*";
        public const string GET_ANNOUNCEMENTS = "https://backend.headpat.de/api/announcements?populate=*";
        public const string GET_USER_DATA = "https://backend.headpat.de/api/user-data?populate=avatar";
        public const string USER_DATA_USER_FILTER = "&filters[id][$in][{0}]={1}";
        public const string LOGIN_USER = "https://backend.headpat.de/api/auth/local";
        public const string VALIDATE_USER = "https://backend.headpat.de/api/users/me";
        public const string RESET_PASSWORD = "https://backend.headpat.de/api/auth/reset-password";
        public const string GET_POINTS_OF_INTEREST = "https://backend.headpat.de/api/publicmaps?populate=*";

        public const string PAGINATION = "&pagination[start]={0}&pagination[limit]={1}";
    }
}
