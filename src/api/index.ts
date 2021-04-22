const API_BASE = 'http://genox.lan:8080'

// const API_BASE = 'http://10.96.97.26:8080'

export const getCurrent = async() => {
  const resp = await fetch(API_BASE + '/current')
  if (resp.status >= 200 && resp.status < 300) {
    return resp.json()
  } else {
    throw new Error(resp.statusText)
  }
}

export const getToday = async() => {
  const resp = await fetch(API_BASE + '/today')
  if (resp.status >= 200 && resp.status < 300) {
    return resp.json()
  } else {
    throw new Error(resp.statusText)
  }
}

export const getYesterday = async() => {
  const resp = await fetch(API_BASE + '/yesterday')
  if (resp.status >= 200 && resp.status < 300) {
    return resp.json()
  } else {
    throw new Error(resp.statusText)
  }
}
