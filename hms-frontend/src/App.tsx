import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import AppLayout from "./layouts/AppLayout"
import Dashboard from "./pages/Dashboard"
import Rooms from "./pages/Rooms"
import Bookings from "./pages/Bookings"
import Customers from "./pages/Customers"
import Staff from "./pages/Staff"
import NewBooking from "./pages/NewBooking"
import RoomCalendar from "./pages/RoomCalendar"
import BookingDetails from "./pages/BookingDetials"
import EditBooking from "./pages/EditBooking"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />}/>
          <Route path="rooms" element={<Rooms />}/>
          <Route path="/calendar" element={<RoomCalendar />} />
          <Route path="bookings" element={<Bookings />}/>
          <Route path="bookings/new" element={<NewBooking />}/>
          <Route path="/bookings/:id" element={<BookingDetails />} />
          <Route path="/bookings/edit/:id" element={<EditBooking />} />
          <Route path="customers" element={<Customers />}/>
          <Route path="staff" element={<Staff />}/>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
