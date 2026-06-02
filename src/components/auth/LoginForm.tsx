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
    <div className="glass-card p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="user_id" className="mb-2 flex items-center text-sm font-bold text-white/85">
            <User className="w-5 h-5 mr-2 text-blue-300" />
            User ID
          </label>
          <div className="relative">
            <input
              id="user_id"
              type="text"
              value={user_id}
              onChange={(e) => setUserId(e.target.value)}
              className={`form-input-dark ${
                errors.user_id ? 'border-red-400 focus:border-red-300 focus:ring-red-300/20' : ''
              }`}
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
          <label htmlFor="password" className="mb-2 flex items-center text-sm font-bold text-white/85">
            <Lock className="w-5 h-5 mr-2 text-blue-300" />
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`form-input-dark pr-10 ${
                errors.password ? 'border-red-400 focus:border-red-300 focus:ring-red-300/20' : ''
              }`}
              placeholder="Password"
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
              className="h-4 w-4 rounded border-white/30 bg-white/10 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-200">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <a href="#" className="font-semibold text-blue-300 hover:text-blue-200 transition-colors">
              Forgot password?
            </a>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            className="btn-primary w-full bg-gradient-to-r from-blue-500 to-blue-700 py-3.5 text-base shadow-blue-950/40"
          >
            Sign In <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-300">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-blue-300 hover:text-blue-200 transition-colors">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
