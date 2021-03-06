export const formatDate = (aDate: Date, timeOnly = false, showSeconds = true) => {
  let dayPart = ''
  const hour = aDate.getHours()
  const hourString = hour > 9 ? `${hour}` : `0${hour}`
  const minutes = aDate.getMinutes()
  const minutesString = minutes > 9 ? `${minutes}` : `0${minutes}`
  const seconds = aDate.getSeconds()
  const secondsString = showSeconds ? seconds > 9 ? `${seconds}` : `0${seconds}` : ''
  const timePart = `${hourString}:${minutesString}${showSeconds ? ':' : ''}${secondsString}`
  if (timeOnly) {
    return timePart
  } else {
    const month = aDate.getMonth() + 1
    const monthString = month > 9 ? `${month}` : `0${month}`
    const date = aDate.getDate()
    const dateString = date > 9 ? `${date}` : `0${date}`
    dayPart = `${aDate.getFullYear()}-${monthString}-${dateString}`
    return `${dayPart} ${timePart}`
  }
}

export const startOfDate = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
}
