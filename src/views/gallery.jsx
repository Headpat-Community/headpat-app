import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const Gallerypage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [enableNsfw, setEnableNsfw] = useState(false);
  const [gallery, setGallery] = useState([
    {
      id: 1,
      attributes: {
        name: 'fafa sockies',
        imgalt: 'fafa sockies :3',
        nsfw: false,
        createdAt: '2023-08-28T18:35:04.897Z',
        updatedAt: '2023-08-28T18:35:04.897Z',
        longtext: null,
        pats: null,
        votes: null,
        img: {
          data: {
            id: 83,
            attributes: {
              name: 'faye_socks.png',
              alternativeText: null,
              caption: null,
              width: 2000,
              height: 3000,
              formats: {
                small: {
                  name: 'small_faye_socks.png',
                  hash: 'small_faye_socks_c8dc5fae98',
                  ext: '.png',
                  mime: 'image/png',
                  path: null,
                  width: 333,
                  height: 500,
                  size: 283.17,
                  url: 'https://cdn.headpat.de/small_faye_socks_c8dc5fae98.png',
                },
              },
              hash: 'faye_socks_c8dc5fae98',
              ext: '.png',
              mime: 'image/png',
              size: 1554.51,
              url: 'https://cdn.headpat.de//1/faye_socks_c8dc5fae98.png',
              previewUrl: null,
              provider: 'strapi-provider-cloudflare-r2',
              provider_metadata: null,
              createdAt: '2023-08-28T18:35:09.997Z',
              updatedAt: '2023-08-28T18:35:09.997Z',
            },
          },
        },
      },
    },
    {
      id: 2,
      attributes: {
        name: 'miu paws',
        imgalt: 'miu paws',
        nsfw: false,
        createdAt: '2023-08-28T18:35:04.897Z',
        updatedAt: '2023-08-28T18:35:04.897Z',
        longtext: null,
        pats: null,
        votes: null,
        img: {
          data: {
            id: 83,
            attributes: {
              name: 'Miu_feeties.png',
              alternativeText: null,
              caption: null,
              width: 2000,
              height: 3000,
              formats: {
                small: {
                  name: 'small_faye_socks.png',
                  hash: 'small_faye_socks_c8dc5fae98',
                  ext: '.png',
                  mime: 'image/png',
                  path: null,
                  width: 333,
                  height: 500,
                  size: 283.17,
                  url: 'https://cdn.headpat.de/small_Miu_feeties_4c94dccc2a.png',
                },
              },
              hash: 'Miu_feeties_4c94dccc2a',
              ext: '.png',
              mime: 'image/png',
              size: 84.65,
              url: 'https://cdn.headpat.de//1/Miu_feeties_4c94dccc2a.png',
              previewUrl: null,
              provider: 'strapi-provider-cloudflare-r2',
              provider_metadata: null,
              createdAt: '2023-08-31T17:06:20.143Z',
              updatedAt: '2023-08-31T17:06:20.143Z',
            },
          },
        },
      },
    },
  ]);
  const [error, setError] = useState(null);

  const windowWidth = Dimensions.get('window').width;

  /*
  useEffect(() => {
    const fetchGalleryData = async () => {
      setIsLoading(true);
      const filters = !enableNsfw ? `&queries[]=equal("nsfw",false)` : ``;
      const pageSize = 25; // Number of items per page
      const offset = (currentPage - 1) * pageSize; // Calculate offset based on current page
      const apiUrl = `https://headpat.de/api/gallery/getTotalGallery?populate=img&${filters}`; // &queries[]=limit(${pageSize})&queries[]=offset(${offset})

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
        });

        const data = await response.json();

        //setGallery(data.data);
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };

    fetchGalleryData();
  }, []);
  */

  const Item = ({ data }) => (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image
          source={{
            uri: data.attributes.img.data.attributes.formats.small.url,
          }}
          alt={data.attributes.imgalt}
          style={{
            width: windowWidth * 0.9, // 90% of screen width
            height:
              windowWidth *
              0.9 *
              (data.attributes.img.data.attributes.formats.small.height /
                data.attributes.img.data.attributes.formats.small.width), // maintain aspect ratio
          }}
          resizeMode='contain'
        />
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <FlatList
      data={gallery}
      renderItem={({ item }) => <Item data={item} />}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
});

export default Gallerypage;
