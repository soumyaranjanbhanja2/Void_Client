import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav style={{ background: '#eee', padding: '10px', display:'flex', gap:'15px' }}>
      <Link to="/">Home</Link>
      {!token ? (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </>
      ) : (
        <>
          {role === 'user' && <Link to="/notes">My Notes</Link>}
          {role === 'admin' && <Link to="/admin">Dashboard</Link>}
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </nav>
  );
}
export default Navbar;