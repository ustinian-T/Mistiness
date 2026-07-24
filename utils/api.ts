const API_BASE = 'http://localhost:8080/api'

export async function httpGet(path: string, params?: Record<string, any>): Promise<any> {
  let url = `${API_BASE}${path}`
  if (params) {
    const qs = new URLSearchParams(params).toString()
    if (qs) url += `?${qs}`
  }
  return uni.request({
    url,
    method: 'GET',
    timeout: 30000,
  }).then(res => res.data)
}

export async function httpPost(path: string, data?: Record<string, any>): Promise<any> {
  return uni.request({
    url: `${API_BASE}${path}`,
    method: 'POST',
    data: data || {},
    header: { 'Content-Type': 'application/json' },
    timeout: 60000,
  }).then(res => res.data)
}

export async function httpStream(path: string, params?: Record<string, any>, onChunk?: (chunk: any) => void): Promise<any> {
  return new Promise((resolve, reject) => {
    let url = `${API_BASE}${path}`
    if (params) {
      const qs = new URLSearchParams(params).toString()
      if (qs) url += `?${qs}`
    }
    
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.setRequestHeader('Accept', 'text/event-stream')
    xhr.onprogress = () => {
      try {
        const text = xhr.responseText
        const lines = text.split('\n\n').filter(l => l.trim())
        if (lines.length > 0) {
          const lastLine = lines[lines.length - 1]
          if (lastLine.startsWith('data: ')) {
            const data = JSON.parse(lastLine.slice(6))
            if (onChunk) onChunk(data)
            if (data.done) resolve(data)
          }
        }
      } catch (e) {
        console.error('SSE parse error:', e)
      }
    }
    xhr.onload = () => {
      try {
        const text = xhr.responseText
        const lines = text.split('\n\n').filter(l => l.trim())
        if (lines.length > 0) {
          const lastLine = lines[lines.length - 1]
          if (lastLine.startsWith('data: ')) {
            resolve(JSON.parse(lastLine.slice(6)))
          } else {
            resolve({ done: true, text })
          }
        } else {
          resolve({ done: true })
        }
      } catch (e) {
        reject(e)
      }
    }
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send()
  })
}

export async function getFlowers(): Promise<any> {
  return httpGet('/flowers')
}

export async function getFlowerByMonth(month: number): Promise<any> {
  return httpGet(`/flowers/month/${month}`)
}

export async function getPoems(month: number): Promise<any> {
  return httpGet(`/poems/${month}`)
}

export async function getKeywords(): Promise<any> {
  return httpGet('/keywords')
}

export async function recommendByKeyword(keyword: string): Promise<any> {
  return httpGet('/recommend', { keyword })
}

export async function getDynastyStats(): Promise<any> {
  return httpGet('/stats/dynasty')
}

export async function getBroadcast(month: number): Promise<any> {
  return httpGet(`/broadcast/${month}`)
}

export async function getPodcast(month: number): Promise<any> {
  return httpGet(`/podcast/${month}`)
}

export async function getPodcastStream(month: number, onChunk?: (chunk: any) => void): Promise<any> {
  return httpStream(`/podcast/${month}/stream`, {}, onChunk)
}

export async function getPodcastDialog(month: number): Promise<any> {
  return httpGet(`/podcast-dialog/${month}`)
}

export async function getPodcastDialogStream(month: number, onChunk?: (chunk: any) => void): Promise<any> {
  return httpStream(`/podcast-dialog/${month}/stream`, {}, onChunk)
}

export async function generateTTS(text: string, voice?: string): Promise<any> {
  return httpPost('/tts', { text, voice })
}

export async function generateTTSDialog(paragraphs: any[], text?: string): Promise<any> {
  return httpPost('/tts-dialog', { paragraphs, text })
}

export async function saveRecord(queryType: string, queryInput: string, resultText: string): Promise<any> {
  return httpPost('/records', { queryType, queryInput, resultText })
}
