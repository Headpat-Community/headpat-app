import { FlatList, View } from 'react-native'
import { Text } from '~/components/ui/text'
import { Image } from 'expo-image'
import { database } from '~/lib/appwrite'

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


export default function HomeView() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text>This is the Gallery!</Text>
      <Image
        className=""
        source={require('assets/images/headpat_logo.png')}
        // placeholder={blurhash}
        contentFit="cover"
        // transition={1000}
        allowDownscaling={true}
        style={{ width: 200, height: 200, marginTop: 20}}
      />
    </View>
  )
}
