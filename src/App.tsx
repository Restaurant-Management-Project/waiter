import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import RequestsPage from './pages/RequestsPage';
import { OrderPage } from './pages/OrderPage';
import AuthPage from "./pages/AuthPage.tsx";
import OrdersPage from './pages/OrdersPage';
import './App.css';

function AppContent() {
    const location = useLocation();

    const hideNav = location.pathname === '/auth';

    return (
        <>
            {!hideNav && (
                <div className="nav-bar">
                    <NavLink
                        to="/new-order"
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                    >
                        New order
                    </NavLink>
                    <NavLink
                        to="/requests"
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                    >
                        Requests
                    </NavLink>
                    <NavLink
                        to="/orders"
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                    >
                        Orders
                    </NavLink>
                </div>
            )}

            <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/new-order" element={<OrderPage />} />
                <Route path="/orders" element={<OrdersPage />} />
            </Routes>
        </>
    );
}

export function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}
