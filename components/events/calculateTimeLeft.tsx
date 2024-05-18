export const calculateTimeLeft = (eventDate: string, eventEndDate: string) => {
  const now = new Date()
  const eventStart = new Date(eventDate)
  const eventEnd = new Date(eventEndDate)
  const differenceInTime = eventEnd.getTime() - now.getTime()

  if (now < eventStart) {
    // Event hasn't started yet
    if (differenceInTime < 0) {
      return 'Event has ended'
    } else {
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24))
      const differenceInHours = Math.ceil(differenceInTime / (1000 * 3600))
      const differenceInMinutes = Math.ceil(differenceInTime / (1000 * 60))

      if (differenceInDays > 1) {
        return `${differenceInDays} days left`
      } else if (differenceInHours > 1) {
        return `${differenceInHours} hours left`
      } else {
        return `${differenceInMinutes} minutes left`
      }
    }
  } else {
    // Event has started, but not ended
    if (differenceInTime < 0) {
      return 'Event has ended'
    } else {
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24))
      const differenceInHours = Math.ceil(differenceInTime / (1000 * 3600))
      const differenceInMinutes = Math.ceil(differenceInTime / (1000 * 60))

      if (differenceInDays > 1) {
        return `${differenceInDays} days until end`
      } else if (differenceInHours > 1) {
        return `${differenceInHours} hours until end`
      } else {
        return `${differenceInMinutes} minutes until end`
      }
    }
  }
}

export const formatDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // Months are 0-based in JavaScript
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${day}/${month}/${year} @ ${hours}:${minutes}`
}
