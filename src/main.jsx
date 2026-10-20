import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/press-start-2p'
import '@fontsource/vt323'
import './index.css'
import App from './App'
import { installCursors } from './lib/gfx'

installCursors()
// make sure the pixel font is ready before any canvas draws text
document.fonts?.load('10px "Press Start 2P"')

createRoot(document.getElementById('root')).render(<App />)
