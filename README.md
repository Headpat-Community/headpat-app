[![Crowdin](https://badges.crowdin.net/headpat/localized.svg)](https://crowdin.com/project/headpat)

# Headpat app

How to get started:

First of all, you need to install the dependencies. You can do this by running the following command:

```bash
npm install
```

Make sure to have an android emulator installed on your machine, like Android Studio or have the Expo Go app installed on your phone.

After that, you can start the app, this will run the app in development mode using an android emulator:

```bash
npm run dev
```

If you want to use iOS (this will only work on macOS), you can run the following command:

```bash
npm run ios
```

If you want to run the app on a physical device, you can run one of the following commands:

`npm run dev` or `npm run ios`

This will start the app in development mode, and you can scan the QR code using the Expo Go app on your phone.

## Using the API:

### Using functions:

```ts
  const fetchUsers = async () => {
    try {
      const data = await functions.createExecution(
        'user-endpoints',
        '',
        false,
        '/getUsers',
        ExecutionMethod.GET
      )
      setUsers(JSON.parse(data.responseBody))
    } catch (error) {
      console.error(error)
    }
  }
```

### Using databases:

```ts
  const fetchEvents = async () => {
    try {
      const data: EventsType = await database.listDocuments('hp_db', 'events')
      setEvents(data)
    } catch (error) {
      console.error(error)
    }
  }
```

#### Notes:

You cannot use the database path to get the data using an API key, you need to use the functions path to get the data using an API key.