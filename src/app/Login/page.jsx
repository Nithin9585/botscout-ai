'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../../../firebase/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/button';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { setCookie } from 'cookies-next';
import { toast } from 'sonner';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the user's email is verified
      if (!user.emailVerified) {
        toast.error('Please verify your email before logging in.');
        setLoading(false);
        return;
      }

      const registrationData = localStorage.getItem('RegistrationData');
      const { firstName = '', lastName = '', gender = '' } = registrationData ? JSON.parse(registrationData) : {};

      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(firestore, 'users', user.uid), {
          firstName,
          lastName,
          gender,
          email: user.email,
          createdAt: serverTimestamp(),
        });
      }

      localStorage.removeItem('RegistrationData');

      const idToken = await user.getIdToken();
      setCookie('token', idToken, { maxAge: 60 * 60, path: '/' });

      toast.success('Login successful!');
      router.push('/');

    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        toast.error('No account found with this email address.');
      } else if (err.code === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again later.');
      }

      console.error('Login error: ', err);
    } finally {
      setLoading(false);
    }

    // Clear input fields
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="bg-gray-900 bg-opacity-80 border border-gray-700 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center text-purple-400 mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Login
          </span>
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 pl-10 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="relative">
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pl-10 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-gray-500" />
            </button>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-md hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 border border-transparent shadow-md"
            disabled={loading}
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div> : 'Login'}
          </Button>
        </form>

        <p className="mt-4 text-center text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-purple-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;