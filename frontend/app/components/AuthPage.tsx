import React, { useState } from 'react';

// --- AuthPage Component ---
const AuthPage = () => {
  // State to toggle between 'login' and 'signup' views
  const [isLogin, setIsLogin] = useState(true);

  // State for form inputs (simplistic for this example)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State for error messages
  const [error, setError] = useState('');

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate email and password are not empty
    if (!email || !password) {
      setError('Email and Password are required.');
      return;
    }
    
    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    // For sign-up, validate password match
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    // All validation passed - clear error and proceed
    setError('');
    
    // NOTE: This is where you would call your backend API
    if (isLogin) {
      console.log('Login Attempt:', { email, password });
      alert(`Logging in with: ${email}`);
    } else {
      console.log('Sign-Up Attempt:', { email, password });
      alert(`Signing up with: ${email}`);
    }
  };

  // Common input field component for cleaner code
  const InputField = ({ id, label, type, value, onChange }: { id: string; label: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required
        value={value}
        onChange={onChange}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Header Section with Animated Switch */}
        <div className="p-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out"
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Log In"}
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className="px-8 py-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Error message display */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
              </div>
            )}
            
            <InputField
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
            
            <InputField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />

            {/* Only show Confirm Password for Sign Up */}
            {!isLogin && (
              <InputField
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              />
            )}

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:scale-105 transition duration-300 ease-in-out"
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
