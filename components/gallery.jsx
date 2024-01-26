import React, { useEffect, useState } from "react";
import { Text, View, Image } from "react-native";

export default function Gallery() {
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Make the API request when the component is mounted
    fetch("https://headpat-api.fayevr.workers.dev/getGallery", {
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "origin": "HEADPAT_APP_WEB",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        console.log(response);
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setApiData(data);
      })
      .catch((error) => {
        console.error(error);
        setError(error);
      });
  }, []);

  if (error) {
    return (
      <View>
        <Text>{console.log(error)}</Text>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  if (apiData) {
    const firstItem = apiData.data[0]; // Assuming you want to access the first item
    const itemName = firstItem.attributes.name;
    const imageUrl = firstItem.attributes.img.url; // Accessing the image URL

    return (
      <View>
        <Text>Gallery Screen</Text>
        <Text>Name: {itemName}</Text>
        <Image source={{ uri: imageUrl }} style={{ width: 200, height: 300 }} />
        {/* Render your gallery using apiData */}
      </View>
    );
  }

  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
}
