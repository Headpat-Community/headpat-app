export const getAvatarImageUrlView = (
  galleryId: string,
  defaultImage: string = '/logos/Headpat_Logo_web_1024x1024_240518-02.png'
) => {
  if (!galleryId) {
    return defaultImage
  }
  return `https://api.headpat.place/v1/storage/buckets/avatars/files/${galleryId}/view?project=hp-main`
}

export const getAvatarImageUrlPreview = (
  galleryId: string,
  attributes: string
) => {
  return `https://api.headpat.place/v1/storage/buckets/avatars/files/${galleryId}/preview?project=hp-main&${attributes}`
}

export const getBannerImageUrlView = (galleryId: string) => {
  if (!galleryId) {
    return
  }
  return `https://api.headpat.place/v1/storage/buckets/banners/files/${galleryId}/view?project=hp-main`
}

export const getBannerImageUrlPreview = (
  galleryId: string,
  attributes: string
) => {
  if (!galleryId) {
    return
  }
  return `https://api.headpat.place/v1/storage/buckets/banners/files/${galleryId}/preview?project=hp-main&${attributes}`
}

export const getGalleryImageUrlView = (galleryId: string) => {
  if (!galleryId) return
  return `https://api.headpat.place/v1/storage/buckets/gallery/files/${galleryId}/view?project=hp-main`
}

export const getGalleryImageUrlPreview = (
  galleryId: string,
  attributes: string
) => {
  if (!galleryId) return
  return `https://api.headpat.place/v1/storage/buckets/gallery/files/${galleryId}/preview?project=hp-main&${attributes}`
}

export const getCommunityAvatarUrlView = (galleryId: string) => {
  return `https://api.headpat.place/v1/storage/buckets/community-avatars/files/${galleryId}/view?project=hp-main`
}

export const getCommunityAvatarUrlPreview = (
  galleryId: string,
  attributes: string
) => {
  return `https://api.headpat.place/v1/storage/buckets/community-avatars/files/${galleryId}/preview?project=hp-main&${attributes}`
}

export const getCommunityBannerUrlView = (galleryId: string) => {
  if (!galleryId) return
  return `https://api.headpat.place/v1/storage/buckets/community-banners/files/${galleryId}/view?project=hp-main`
}

export const getCommunityBannerUrlPreview = (
  galleryId: string,
  attributes: string
) => {
  return `https://api.headpat.place/v1/storage/buckets/community-banners/files/${galleryId}/preview?project=hp-main&${attributes}`
}
