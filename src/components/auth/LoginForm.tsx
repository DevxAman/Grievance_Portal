import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, ArrowRight, AlertTriangle } from 'lucide-react';

interface LoginFormProps {
  onLogin: (user_id: string, password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [user_id, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    user_id: '',
    password: '',
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      user_id: '',
      password: '',
    };

    if (!user_id) {
      newErrors.user_id = 'User ID is required';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onLogin(user_id, password);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-white/10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="user_id" className="block text-gray-200 mb-2 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-300" />
            User ID
          </label>
          <div className="relative">
            <input
              id="user_id"
              type="text"
              value={user_id}
              onChange={(e) => setUserId(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border ${
                errors.user_id ? 'border-red-500' : 'border-white/20'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Ex: ravi_k12"
            />
          </div>
          {errors.user_id && (
            <p className="mt-1 text-red-400 text-sm flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {errors.user_id}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-gray-200 mb-2 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-blue-300" />
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border ${
                errors.password ? 'border-red-500' : 'border-white/20'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10`}
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-white focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {errors.password && (
            <p className="mt-1 text-red-400 text-sm flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {errors.password}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-200">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <a href="#" className="font-medium text-blue-300 hover:text-blue-200 transition-colors">
              Forgot password?
            </a>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full flex items-center justify-center py-3 px-6 rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 shadow-lg transform hover:translate-y-[-2px] font-medium"
          >
            Sign In <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-300">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-blue-300 hover:text-blue-200 transition-colors">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;