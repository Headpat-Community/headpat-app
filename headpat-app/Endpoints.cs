﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HeadpatCommunity.Mobile.HeadpatApp
{
    public static class Endpoints
    {
        public const string GET_GALLERY = "https://backend.headpat.de/api/galleries?populate=*";
        public const string GET_ANNOUNCEMENTS = "https://backend.headpat.de/api/announcements";
        public const string GET_USER = "https://backend.headpat.de/api/user-data/{0}?populate=*";
        public const string LOGIN_USER = "https://backend.headpat.de/api/auth/local";
        public const string VALIDATE_USER = "https://backend.headpat.de/api/users/me";
        public const string RESET_PASSWORD = "https://backend.headpat.de/api/auth/reset-password";
    }
}