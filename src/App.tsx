import { useEffect, useMemo, useState } from 'react'
import scoopyImg from './assets/scoopy.png'
import iphoneImg from './assets/iphone17.webp'
import telegramQR from './assets/telegram.jpg'
import { ENTRY_PRICE_USD, getNextDrawDate, latestResult } from './raffleConfig'
import './App.css'

const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'] as const

function toKhmerDigits(n: number): string {
  return String(n)
    .split('')
    .map((c) => (c >= '0' && c <= '9' ? KHMER_DIGITS[Number(c)] : c))
    .join('')
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalMs: number
}

function diffToParts(targetMs: number, nowMs: number): TimeRemaining {
  const totalMs = Math.max(0, targetMs - nowMs)
  const totalSeconds = Math.floor(totalMs / 1000)
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    totalMs,
  }
}

function CountdownUnit({
  value,
  labelKm,
  labelEn,
}: {
  value: number
  labelKm: string
  labelEn: string
}) {
  return (
    <div className="countdown-unit">
      <div className="countdown-value">{String(value).padStart(2, '0')}</div>
      <div className="countdown-label">
        <span className="km">{labelKm}</span>
        <span className="en">{labelEn}</span>
      </div>
    </div>
  )
}

function Countdown({ target }: { target: Date }) {
  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const t = diffToParts(target.getTime(), now)
  const drawDateLabel = useMemo(
    () =>
      target.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [target],
  )

  return (
    <section className="countdown" aria-live="polite">
      <div className="countdown-heading">
        <span className="km">លទ្ធផលនឹងត្រូវប្រកាសក្នុង</span>
        <span className="en">Results announced in</span>
      </div>
      <div className="countdown-grid">
        <CountdownUnit value={t.days} labelKm="ថ្ងៃ" labelEn="Days" />
        <CountdownUnit value={t.hours} labelKm="ម៉ោង" labelEn="Hours" />
        <CountdownUnit value={t.minutes} labelKm="នាទី" labelEn="Mins" />
        <CountdownUnit value={t.seconds} labelKm="វិនាទី" labelEn="Secs" />
      </div>
      <div className="countdown-date">
        <span className="km">ថ្ងៃប្រកាស៖ {drawDateLabel}</span>
        <span className="en">Draw: {drawDateLabel}</span>
      </div>
    </section>
  )
}

interface PrizeCardProps {
  tierKm: string
  tierEn: string
  image: string
  imageAlt: string
  nameKm: string
  nameEn: string
  matchKm: string
  matchEn: string
}

function PrizeCard({
  tierKm,
  tierEn,
  image,
  imageAlt,
  nameKm,
  nameEn,
  matchKm,
  matchEn,
}: PrizeCardProps) {
  return (
    <article className="prize-card">
      <div className="prize-tier">
        <span className="km">{tierKm}</span>
        <span className="en">{tierEn}</span>
      </div>
      <div className="prize-image">
        <img src={image} alt={imageAlt} />
      </div>
      <h3 className="prize-name">
        <span className="km">{nameKm}</span>
        <span className="en">{nameEn}</span>
      </h3>
      <p className="prize-match">
        <span className="km">{matchKm}</span>
        <span className="en">{matchEn}</span>
      </p>
    </article>
  )
}

function Prizes() {
  return (
    <section className="prizes">
      <h2 className="section-heading">
        <span className="km">រង្វាន់</span>
        <span className="en">Prizes</span>
      </h2>
      <div className="prize-grid">
        <PrizeCard
          tierKm="រង្វាន់ទី ១"
          tierEn="1st Prize"
          image={scoopyImg}
          imageAlt="Honda Scoopy motorcycle"
          nameKm="ម៉ូតូ Honda Scoopy"
          nameEn="Honda Scoopy"
          matchKm={`ត្រូវលេខទាំង ${toKhmerDigits(5)}`}
          matchEn="Match all 5 numbers"
        />
        <PrizeCard
          tierKm="រង្វាន់ទី ២"
          tierEn="2nd Prize"
          image={iphoneImg}
          imageAlt="iPhone 17"
          nameKm="ទូរស័ព្ទ iPhone 17"
          nameEn="iPhone 17"
          matchKm={`ត្រូវលេខ ${toKhmerDigits(4)}`}
          matchEn="Match 4 numbers"
        />
      </div>
    </section>
  )
}

function NumberSlot({ value, revealed }: { value: number | null; revealed: boolean }) {
  return (
    <div className={`number-slot ${revealed ? 'revealed' : 'hidden'}`}>
      {revealed && value !== null ? (
        <span className="number-value">{value}</span>
      ) : (
        <span className="number-star" aria-label="hidden number">
          ★
        </span>
      )}
    </div>
  )
}

function WinningNumbers({ numbers }: { numbers: number[] | null }) {
  const slots = Array.from({ length: 5 }, (_, i) => (numbers ? (numbers[i] ?? null) : null))
  const revealed = numbers !== null

  return (
    <section className="winning-numbers">
      <h2 className="section-heading">
        <span className="km">លេខឈ្នះប្រចាំខែ</span>
        <span className="en">This month&rsquo;s winning numbers</span>
      </h2>
      <div className="number-row">
        {slots.map((n, i) => (
          <NumberSlot key={i} value={n} revealed={revealed} />
        ))}
      </div>
      {!revealed && (
        <p className="reveal-note">
          <span className="km">លេខនឹងលាតត្រដាងនៅពេលឆ្នោតចេញ</span>
          <span className="en">Numbers are revealed when the draw closes</span>
        </p>
      )}
    </section>
  )
}

function HowToEnter() {
  return (
    <section className="how-to-enter">
      <h2 className="section-heading">
        <span className="km">របៀបចូលរួម</span>
        <span className="en">How to enter</span>
      </h2>
      <ol className="steps">
        <li>
          <span className="step-num">{toKhmerDigits(1)}</span>
          <div>
            <p className="km">បង់ត្រឹមតែ {toKhmerDigits(ENTRY_PRICE_USD)} ដុល្លារដើម្បីចូលរួម</p>
            <p className="en">Pay just ${ENTRY_PRICE_USD} to enter</p>
          </div>
        </li>
        <li>
          <span className="step-num">{toKhmerDigits(2)}</span>
          <div>
            <p className="km">ស្កេន QR ឬផ្ញើសារមក Telegram</p>
            <p className="en">Scan the QR or message us on Telegram</p>
          </div>
        </li>
        <li>
          <span className="step-num">{toKhmerDigits(3)}</span>
          <div>
            <p className="km">
              ជ្រើសរើសលេខ {toKhmerDigits(5)} ពី {toKhmerDigits(1)} ដល់ {toKhmerDigits(99)}{' '}
              ហើយផ្ញើមកយើង
            </p>
            <p className="en">Pick 5 numbers from 1 to 99 and send them to us</p>
          </div>
        </li>
      </ol>
      <div className="telegram-card">
        <img src={telegramQR} alt="Telegram QR code" />
        <div className="telegram-info">
          <p className="telegram-eyebrow">Telegram</p>
          <p className="telegram-instruction">
            <span className="km">
              ជ្រើសរើសលេខ {toKhmerDigits(5)} ពី {toKhmerDigits(1)} ដល់ {toKhmerDigits(99)}{' '}
              ហើយផ្ញើមកកាន់ Telegram
            </span>
            <span className="en">Pick 5 numbers from 1 to 99 and send them to Telegram</span>
          </p>
        </div>
      </div>
    </section>
  )
}

function App() {
  const target = useMemo(() => getNextDrawDate(), [])
  const numbers = latestResult?.numbers ?? null

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-text">
          <p className="eyebrow">
            <span className="km">ឆ្នោតខ្មែរ</span>
            <span className="en">Khmer Raffle</span>
          </p>
          <h1>
            <span className="km">ឈ្នះម៉ូតូ Honda Scoopy</span>
            <span className="en">Win a Honda Scoopy</span>
          </h1>
          <p className="hero-sub">
            <span className="km">តម្លៃត្រឹមតែ {toKhmerDigits(ENTRY_PRICE_USD)} ដុល្លារ</span>
            <span className="en">Only ${ENTRY_PRICE_USD} to enter</span>
          </p>
        </div>
        <div className="hero-image">
          <img src={scoopyImg} alt="Honda Scoopy motorcycle prize" />
        </div>
      </header>

      <Prizes />
      <Countdown target={target} />
      <WinningNumbers numbers={numbers} />
      <HowToEnter />

      <footer className="footer">
        <p>
          <span className="km">© ឆ្នោតខ្មែរ — លេងដោយទំនួលខុសត្រូវ</span>
          <span className="en">© Khmer Raffle — Play responsibly</span>
        </p>
      </footer>
    </div>
  )
}

export default App
