import { useEffect, useState } from 'react'
import { i18n } from '~/components/system/i18n'

export const calculateTimeLeftEvent = (
  eventDate: string,
  eventEndDate: string,
  upcoming = false
) => {
  const now = new Date()
  const eventStart = new Date(eventDate)
  const eventEnd = new Date(eventEndDate)

  // Check if the year is 2100
  if (eventEnd.getFullYear() === 2100) {
    return i18n.t('time.infinite')
  }

  const upcomingTime = eventStart.getTime() - now.getTime()
  const differenceInTime = eventEnd.getTime() - now.getTime()

  const timeLeft = upcoming ? upcomingTime : differenceInTime

  if (now < eventStart) {
    // Event hasn't started yet
    if (differenceInTime < 0) {
      return i18n.t('time.eventHasEnded')
    } else {
      const differenceInDays = Math.ceil(timeLeft / (1000 * 3600 * 24))
      const differenceInHours = Math.ceil(timeLeft / (1000 * 3600))
      const differenceInMinutes = Math.ceil(timeLeft / (1000 * 60))

      if (differenceInDays > 1) {
        return `${differenceInDays} ` + i18n.t('time.daysLeft')
      } else if (differenceInHours > 1) {
        return `${differenceInHours} ` + i18n.t('time.hoursLeft')
      } else {
        return `${differenceInMinutes} ` + i18n.t('time.minutesLeft')
      }
    }
  } else {
    // Event has started, but not ended
    if (timeLeft < 0) {
      return i18n.t('time.eventHasEnded')
    } else {
      const differenceInDays = Math.ceil(timeLeft / (1000 * 3600 * 24))
      const differenceInHours = Math.ceil(timeLeft / (1000 * 3600))
      const differenceInMinutes = Math.ceil(timeLeft / (1000 * 60))

      if (differenceInDays > 1) {
        return `${differenceInDays} ` + i18n.t('time.daysUntilEnd')
      } else if (differenceInHours > 1) {
        return `${differenceInHours} ` + i18n.t('time.hoursUntilEnd')
      } else {
        return `${differenceInMinutes} ` + i18n.t('time.minutesUntilEnd')
      }
    }
  }
}

export const calculateTimeLeft = (date: string) => {
  const now = new Date()
  const eventEnd = new Date(date)

  // Check if the year is 2100
  if (eventEnd.getFullYear() === 2100) {
    return i18n.t('time.infinite')
  }

  const differenceInTime = eventEnd.getTime() - now.getTime()

  // Event hasn't started yet
  if (differenceInTime < 0) {
    return i18n.t('time.ended')
  } else {
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24))
    const differenceInHours = Math.ceil(differenceInTime / (1000 * 3600))
    const differenceInMinutes = Math.ceil(differenceInTime / (1000 * 60))

    if (differenceInDays > 1) {
      return `${differenceInDays} ` + i18n.t('time.daysLeft')
    } else if (differenceInHours > 1) {
      return `${differenceInHours} ` + i18n.t('time.hoursLeft')
    } else {
      return `${differenceInMinutes} ` + i18n.t('time.minutesLeft')
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

export const useTimeLeft = (date: string) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(date))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(date))
    }, 1000)

    return () => clearInterval(interval)
  }, [date])

  return timeLeft
}

export const useTimeSince = (timestamp: string) => {
  const [timeElapsed, setTimeElapsed] = useState(() => timeSince(timestamp))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(timeSince(timestamp))
    }, 1000)

    return () => clearInterval(interval)
  }, [timestamp])

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
    return `${Math.floor(secondsPast / 60)} ` + i18n.t('time.minutesAgo')
  }
  if (secondsPast <= 86400) {
    return `${Math.floor(secondsPast / 3600)} ` + i18n.t('time.hoursAgo')
  }
  if (secondsPast <= 604800) {
    return `${Math.floor(secondsPast / 86400)} ` + i18n.t('time.daysAgo')
  }
  return formatDate(past)
}

export const calculateBirthday = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}
