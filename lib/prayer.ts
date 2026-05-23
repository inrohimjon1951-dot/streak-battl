import { PrayerTimes } from '@/types'

// Vodil, Kashkadarya, Uzbekistan coordinates
const VODIL_LAT = 38.8731
const VODIL_LNG = 65.7914

export async function getPrayerTimes(date?: Date): Promise<PrayerTimes | null> {
  try {
    const d = date || new Date()
    const day = d.getDate()
    const month = d.getMonth() + 1
    const year = d.getFullYear()

    const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${VODIL_LAT}&longitude=${VODIL_LNG}&method=3`
    const res = await fetch(url)
    const data = await res.json()

    if (data.code === 200) {
      const timings = data.data.timings
      return {
        Fajr: timings.Fajr,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha,
      }
    }
    return null
  } catch {
    return null
  }
}

export function getCurrentPrayer(times: PrayerTimes): string | null {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const prayerMinutes: Record<string, number> = {}
  for (const [name, time] of Object.entries(times)) {
    const [h, m] = time.split(':').map(Number)
    prayerMinutes[name] = h * 60 + m
  }

  const order = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
  let currentPrayer = null

  for (let i = order.length - 1; i >= 0; i--) {
    if (currentMinutes >= prayerMinutes[order[i]]) {
      currentPrayer = order[i]
      break
    }
  }

  return currentPrayer
}

export function getMinutesLate(prayerTime: string): number {
  const [h, m] = prayerTime.split(':').map(Number)
  const prayerMinutes = h * 60 + m
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const diff = currentMinutes - prayerMinutes
  return diff > 0 ? diff : 0
}

export const PRAYER_NAMES_UZ: Record<string, string> = {
  Fajr: 'Bomdod',
  Dhuhr: 'Peshin',
  Asr: 'Asr',
  Maghrib: 'Shom',
  Isha: 'Xufton',
}
