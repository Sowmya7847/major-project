import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await register(name, email, password, role);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">Register</h2>
                {error && <div className="p-3 mb-4 text-red-500 bg-red-900/20 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm text-gray-400">Name</label>
                        <input
                            type="text"
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm text-gray-400">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm text-gray-400">Password</label>
                        <input
                            type="password"
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm text-gray-400">Role</label>
                        <select
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-500 transition-colors"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-400">
                    Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
