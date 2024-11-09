import { useEffect, useState } from 'react'

export const calculateTimeLeft = (
  eventDate: string,
  eventEndDate: string,
  upcoming: boolean = false
) => {
  const now = new Date()
  const eventStart = new Date(eventDate)
  const eventEnd = new Date(eventEndDate)
  const upcomingTime = eventStart.getTime() - now.getTime()
  const differenceInTime = eventEnd.getTime() - now.getTime()

  const timeLeft = upcoming ? upcomingTime : differenceInTime

  if (now < eventStart) {
    // Event hasn't started yet
    if (differenceInTime < 0) {
      return 'Event has ended'
    } else {
      const differenceInDays = Math.ceil(timeLeft / (1000 * 3600 * 24))
      const differenceInHours = Math.ceil(timeLeft / (1000 * 3600))
      const differenceInMinutes = Math.ceil(timeLeft / (1000 * 60))

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
    if (timeLeft < 0) {
      return 'Event has ended'
    } else {
      const differenceInDays = Math.ceil(timeLeft / (1000 * 3600 * 24))
      const differenceInHours = Math.ceil(timeLeft / (1000 * 3600))
      const differenceInMinutes = Math.ceil(timeLeft / (1000 * 60))

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
  return `${day}.${month}.${year} @ ${hours}:${minutes}`
}

export const formatDateLocale = (date: Date) => {
  // Format the date
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // Months are 0-based in JavaScript
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  // Get the timezone offset in hours and minutes
  const timezoneOffset = -date.getTimezoneOffset() // In minutes
  const offsetHours = Math.floor(timezoneOffset / 60)
    .toString()
    .padStart(2, '0')
  const offsetMinutes = (timezoneOffset % 60).toString().padStart(2, '0')
  const offsetSign = timezoneOffset >= 0 ? '+' : '-'

  // Combine the formatted date with the timezone offset
  return `${day}.${month}.${year} @ ${hours}:${minutes} GMT${offsetSign}${offsetHours}:${offsetMinutes}`
}

export const useTimeSince = (timestamp: string) => {
  const [timeElapsed, setTimeElapsed] = useState(() => timeSince(timestamp))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(timeSince(timestamp))
    }, 1000)

    return () => clearInterval(interval)
  }, [timestamp, timeSince])

  return timeElapsed
}

export const timeSince = (date: string) => {
  const now = new Date()
  const past = new Date(date)
  const secondsPast = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (secondsPast < 60) {
    return `${secondsPast} seconds ago`
  }
  if (secondsPast < 3600) {
    return `${Math.floor(secondsPast / 60)} minutes ago`
  }
  if (secondsPast <= 86400) {
    return `${Math.floor(secondsPast / 3600)} hours ago`
  }
  if (secondsPast <= 604800) {
    return `${Math.floor(secondsPast / 86400)} days ago`
  }
  return formatDate(past)
}

export const calculateBirthday = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}
