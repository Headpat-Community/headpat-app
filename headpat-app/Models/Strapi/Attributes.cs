using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HeadpatCommunity.HeadpatApp.Models.Strapi
{
    public abstract class Attributes
    {
        [JsonPropertyName("createdAt")]
        public DateTime Created { get; set; }

        [JsonPropertyName("updatedAt")]
        public DateTime Updated { get; set; }
    }

    public class AnnouncementAttributes : Attributes
    {
        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("sidetext")]
        public string SideText { get; set; }

        [JsonPropertyName("validuntil")]
        public DateTime ValidUntil { get; set; }

        [JsonIgnore]
        public bool IsValid => ValidUntil >= DateTime.Now;

        [JsonIgnore]
        public bool IsNotValid => !IsValid;

        [JsonPropertyName("users_permissions_user")]
        public Response<UsersPermissionsUser> CreatedBy { get; set; }

        [JsonIgnore]
        public UserData CreatedBy_UserData { get; set; }
    }

    public class ImageAttributes : Attributes
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("alternativeText")]
        public object AlternativeText { get; set; }

        [JsonPropertyName("caption")]
        public object Caption { get; set; }

        [JsonPropertyName("width")]
        public int Width { get; set; }

        [JsonPropertyName("height")]
        public int Height { get; set; }

        [JsonPropertyName("formats")]
        public Formats Formats { get; set; }

        [JsonPropertyName("hash")]
        public string Hash { get; set; }

        [JsonPropertyName("ext")]
        public string Ext { get; set; }

        [JsonPropertyName("mime")]
        public string MimeType { get; set; }

        [JsonPropertyName("size")]
        public double Size { get; set; }

        [JsonPropertyName("url")]
        public string Url { get; set; }

        [JsonIgnore]
        public string FinalImageUrl
        {
            get
            {
                if (MimeType == "image/gif" || Formats.SmallImage is null)
                    return Url;
                else
                    return Formats.SmallImage.Url;
            }
        }
    }

    public class GalleryItemAttributes : Attributes
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("imgalt")]
        public string ImgAlt { get; set; }

        [JsonPropertyName("nsfw")]
        public bool IsNsfw { get; set; }
#nullable enable
        [JsonPropertyName("longtext")]
        public string? Description { get; set; }
#nullable disable
        [JsonPropertyName("pats")]
        public long? Pats { get; set; }

        [JsonPropertyName("votes")]
        public long? Votes { get; set; }

        [JsonPropertyName("img")]
        public Response<ImageData> Img { get; set; }

        [JsonPropertyName("users_permissions_user")]
        public Response<UsersPermissionsUser> CreatedBy { get; set; }

        [JsonIgnore]
        public UserData CreatedBy_UserData { get; set; }
    }

    public class UserDataAttributes : Attributes
    {
        [JsonPropertyName("bio")]
        public string Bio { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; }

        [JsonPropertyName("birthday")]
        public DateTime DateOfBirth { get; set; }

        [JsonPropertyName("displayname")]
        public string DisplayName { get; set; }

        [JsonPropertyName("pronouns")]
        public string Pronouns { get; set; }

        [JsonPropertyName("discordname")]
        public string DiscordName { get; set; }

        [JsonPropertyName("telegramname")]
        public string TelegramName { get; set; }

        [JsonPropertyName("furaffinityname")]
        public string FuraffinityName { get; set; }

        [JsonPropertyName("enablensfw")]
        public bool IsNsfwEnabled { get; set; }

        [JsonPropertyName("twitchname")]
        public string TwitchName { get; set; }

        [JsonPropertyName("X_name")]
        public string XName { get; set; }

        [JsonPropertyName("pats")]
        public object Pats { get; set; }

        [JsonPropertyName("location")]
        public string Location { get; set; }

        [JsonPropertyName("avatar")]
        public Response<Avatar> Avatar { get; set; }
    }

    public class UsersPermissionsUserAttributes : Attributes
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("username")]
        public string Username { get; set; }

        [JsonPropertyName("email")]
        public string EMail { get; set; }

        [JsonIgnore]
        public string Password { get; set; }

        [JsonPropertyName("provider")]
        public string Provider { get; set; }

        [JsonPropertyName("confirmed")]
        public bool Confirmed { get; set; }

        [JsonPropertyName("blocked")]
        public bool Blocked { get; set; }
    }
}
