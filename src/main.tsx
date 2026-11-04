import React from 'react'
import ReactDOM from 'react-dom/client'
import ErrorBoundary from './components/ErrorBoundary'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Facilities from './pages/Facilities'
import Menu from './pages/Menu'
import Gallery from './pages/Gallery'
import Rooms from './pages/Rooms'
import Booking from './pages/Booking'
import Location from './pages/Location'
import Sitemap from './pages/Sitemap'
import Search from './pages/Search'
import NotFound from './pages/NotFound'
import AdminLayout from './layouts/AdminLayout'
import AdminOverview from './pages/admin/Overview'
import AdminBookings from './pages/admin/Bookings'
import AdminRooms from './pages/admin/Rooms'
import AdminFacilities from './pages/admin/Facilities'
import AdminMenu from './pages/admin/Menu'
import AdminGallery from './pages/admin/Gallery'
import AdminTestimonials from './pages/admin/Testimonials'
import AdminUsers from './pages/admin/Users'
import AdminSettings from './pages/admin/Settings'
import Staff from './pages/Staff'
import { LoginPage } from './components/ui/sign-in-page'
import FloatingChat from './components/FloatingChat'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
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
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/search" element={<Search />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="facilities" element={<AdminFacilities />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="/admin/login" element={<LoginPage role="admin" />} />
        <Route path="/staff/login" element={<LoginPage role="staff" />} />
        <Route path="/staff" element={<Staff />} />
        </Routes>
        <FloatingChat />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
