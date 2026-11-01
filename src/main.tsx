import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Facilities from './pages/Facilities'
import Menu from './pages/Menu'
import Gallery from './pages/Gallery'
import Rooms from './pages/Rooms'
import Booking from './pages/Booking'
import Location from './pages/Location'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/location" element={<Location />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
