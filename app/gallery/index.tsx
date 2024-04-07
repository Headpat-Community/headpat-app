import { Dimensions, FlatList, TouchableWithoutFeedback, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Image } from 'expo-image'
import { database } from '~/lib/appwrite'
import Gallery from 'react-native-awesome-gallery';
import { NavigationProp, NavigatorScreenParams, useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';

// export default function HomeView() {
//   const products = [
//     {
//       image_url:
//         'https://blog.logrocket.com/wp-content/uploads/2024/03/getting-started-nativewind-tailwind-react-native.png',
//     },
//     {
//       image_url:
//         'https://cdn.discordapp.com/attachments/1046970799539617802/1221486753651757056/image.png?ex=6612c130&is=66004c30&hm=c562699ed94e561db08f0b16959c291330dc943d0ec3e4f23356ecfa8fdabbc8&',
//     },
//   ]

//   async function fetchGallery() {
//     const response = await database.listDocuments('hp_web', 'gallery')
//     console.log(response)
//   }

//   const blurhash =
//     '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

//   return (
//     <View className="flex-1 justify-center items-center">
//       <Text>Gallery!</Text>
//       <Image
//         className=""
//         source={'./assets/images/headpat_logo.png'}
//         placeholder={blurhash}
//         contentFit="cover"
//         transition={1000}
//         allowDownscaling={true}
//       />
//       <FlatList
//         data={products}
//         numColumns={1}
//         renderItem={(product_data) => {
//           return (
//             <View className="justify-center p-3">
//               <Image
//                 className="m-5 h-56 w-full mx-auto object-cover bg-slate-500 rounded-lg"
//                 source={'~/assets/images/headpat_logo.png'}
//                 placeholder={blurhash}
//                 contentFit="cover"
//                 transition={1000}
//                 allowDownscaling={true}
//               />
//             </View>
//           )
//         }}
//         keyExtractor={(item) => {
//           return item.image_url
//         }}
//       />
//     </View>
//   )
// }

const { height } = Dimensions.get('window');

const getRandomSize = function () {
  const min = 400;
  const max = 800;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// const images = new Array(10)
//   .fill(0)
//   .map(() => `https://picsum.photos/${getRandomSize()}/${getRandomSize()}`);

const images = new Array(10)
  .fill(0)
  .map(() => `https://picsum.photos/${getRandomSize()}/${getRandomSize()}`);

function HeadpatGallery() {

  return (
    <Gallery
      data={images}
      style={{ flex: 1, backgroundColor: 'white' }}
      onIndexChange={(newIndex) => {
        console.log(newIndex);
      }}
    />
  );
}

export default function HomeView(props) {

  // console.log('gallery props', props)

  const { navigate } = useNavigation();

  return (
    <ScrollView>
      <View style={{padding: 20}}>
        <Text>This is the Gallery!</Text>
      </View>
      <View style={{
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}>
        {images.map((uri, index) => (
          <TouchableWithoutFeedback
            key={uri}
            onPress={() => navigate('gallery/viewer', { params: { index, images }})}
          >
            <Image source={uri} style={{width: '50%', height: 200}} />
          </TouchableWithoutFeedback>
        ))}
      </View>

    </ScrollView>
  )
}