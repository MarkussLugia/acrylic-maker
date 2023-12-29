import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
)

declare global {
  interface Window { screenAnimateFunction: () => void; }
}

window.screenAnimateFunction = () => { void (0) }

function animateLoop() {
  requestAnimationFrame(animateLoop);
  window.screenAnimateFunction()
}
animateLoop()