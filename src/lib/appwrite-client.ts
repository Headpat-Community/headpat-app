import {
	Account,
	Client,
	Functions,
	Locale,
	Storage,
	TablesDB,
} from "react-native-appwrite";

export const client = new Client();

client
	.setEndpoint(`${process.env.EXPO_PUBLIC_BACKEND_URL}/v1`) // Your Appwrite Endpoint
	.setProject("hp-main") // Your project ID
	.setPlatform("com.headpat.app"); // Your application ID or bundle ID.

export const account = new Account(client);
export const databases = new TablesDB(client);
export const functions = new Functions(client);
export const storage = new Storage(client);
export const locale = new Locale(client);
