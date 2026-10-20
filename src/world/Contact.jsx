import { useState } from 'react'
import Win from '../components/Win'
import Px from '../components/Px'
import { contact } from '../data/content'
import { TROPHY } from '../lib/sprites'
import { sfx } from '../lib/audio'
import { store } from '../lib/store'

export default function Contact({ onReplay }) {
  const [coin, setCoin] = useState(false)
  const hire = () => {
    if (coin) return
    setCoin(true); sfx.coin(); store.addScore(1000)
    setTimeout(() => { window.location.href = `mailto:${contact.email}?subject=Let%27s%20work%20together` }, 1000)
    setTimeout(() => setCoin(false), 1800)
  }
  return (
    <section id="world-5" data-world className="world last" aria-labelledby="h-contact">
      <div className="wrap text-center">
        <p className="eyebrow reveal">WORLD 5 · GAME COMPLETE</p>
        <div className="flex justify-center reveal trophy"><Px rows={TROPHY} pal={{ y: '#ffd23d', l: '#fff4a0', d: '#b8741a', w: '#fff' }} s={8} label="Pixel trophy" /></div>
        <h2 id="h-contact" className="pix-title reveal">YOU WIN!</h2>
        <p className="font-pixel text-[11px] leading-6 text-navy reveal">THANKS FOR PLAYING.</p>
        <div className="reveal max-w-xl mx-auto mt-8 text-left">
          <Win title="PLAYER 2 WANTED" color="#ffd36b">
            <dl className="contact-list">
              <div><dt>EMAIL</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></div>
              <div><dt>PHONE</dt><dd><a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a></dd></div>
              <div><dt>LOCATION</dt><dd>{contact.location}</dd></div>
            </dl>
            <div className="flex flex-wrap gap-3 mt-5">
              <a className="pix-btn" href={contact.github} target="_blank" rel="noreferrer">GITHUB</a>
              <a className="pix-btn" href={contact.linkedin} target="_blank" rel="noreferrer">LINKEDIN</a>
              <a className="pix-btn alt" href={contact.resume} download>DOWNLOAD RESUME</a>
            </div>
          </Win>
        </div>
        <div className="reveal mt-10 flex flex-col items-center gap-5">
          <div className="coin-wrap">
            {coin && <i className="coin-fall" aria-hidden="true" />}
            <button className="pix-btn big" onClick={hire}>INSERT COIN TO HIRE ME</button>
          </div>
          <button className="pix-btn small ghost" onClick={onReplay}>PLAY AGAIN</button>
        </div>
      </div>
    </section>
  )
}
