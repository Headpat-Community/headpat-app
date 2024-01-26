import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Image, Dimensions } from 'react-native';

const Gallerypage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [enableNsfw, setEnableNsfw] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [error, setError] = useState(null);

  const windowWidth = Dimensions.get('window').width;

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

        setGallery(data.data);
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.container}>
      <Image
        source={{ uri: item.attributes.img.data.attributes.formats.small.url }}
        style={{
          width: windowWidth * 0.9, // 90% of screen width
          height:
            windowWidth *
            0.9 *
            (item.attributes.img.data.attributes.formats.small.height /
              item.attributes.img.data.attributes.formats.small.width), // maintain aspect ratio
        }}
        resizeMode='contain'
      />
    </View>
  );

  return (
    <FlatList
      data={gallery}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
});

export default Gallerypage;
