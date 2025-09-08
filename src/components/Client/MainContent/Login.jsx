import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

const Login = () => { 
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      const role = result.data.user.roleId;
      if (role === 1) {
        navigate('/admin');
      } else {
        navigate('/');  
      }
    } else {
      setError(result.error.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <button type="submit" className={`bg-blue-500 text-white px-4 py-2 rounded w-full (hover:bg-blue-600 transition-colors ${!email || !password ? 'opacity-50 cursor-not-allowed' : ''} disabled={!email || !password}>)`}>
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;