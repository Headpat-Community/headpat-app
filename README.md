# Headpat app

How to get started:

First of all, you need to install the dependencies. You can do this by running the following command:

```bash
pnpm install
```

Make sure to have an android emulator installed on your machine, like Android Studio or XCode installed on your macOS.

After that, you can start the app, this will run the app in development mode using an android emulator:

```bash
pnpm run dev
```

If you want to use iOS (this will only work on macOS), you can run the following command:

```bash
pnpm run ios
```

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

### Using environment variables

Please copy .env.example to .env and fill in your data.

Making a production build requires environment variables set in https://expo.dev
