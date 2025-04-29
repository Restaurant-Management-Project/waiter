import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import RequestsPage from './pages/RequestsPage';
import { OrderPage } from './pages/OrderPage';
import './App.css';

export function App() {
    return (
        <Router>
            <div className="nav-bar">
                <NavLink
                    to="/order"
                    className={(props: { isActive: boolean }) =>
                        props.isActive ? 'nav-link active' : 'nav-link'
                    }
                >
                    New order
                </NavLink>
                <NavLink
                    to="/requests"
                    className={(props: { isActive: boolean }) =>
                        props.isActive ? 'nav-link active' : 'nav-link'
                    }
                >
                    Requests
                </NavLink>
            </div>

            <Routes>
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/order" element={<OrderPage />} />
            </Routes>
        </Router>
    );
}
