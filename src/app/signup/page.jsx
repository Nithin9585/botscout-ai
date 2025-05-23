'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../../firebase/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/button';
import { faUser, faEnvelope, faLock, faTransgenderAlt, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { toast } from 'sonner';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      localStorage.setItem('RegistrationData', JSON.stringify({ firstName, lastName, gender }));
      toast.success('Registration successful. A verification email has been sent to your email address. Please verify your email before logging in.');

      setFirstName('');
      setLastName('');
      setGender('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      router.push('/');

    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered.');
      } else if (err.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        toast.error('Password must be at least 6 characters long.');
      } else {
        toast.error('An error occurred, please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="bg-gray-900 bg-opacity-80 border border-gray-700 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center text-teal-400 mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-600">
            Register
          </span>
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <label htmlFor="firstName" className="sr-only">First Name</label>
            <FontAwesomeIcon icon={faUser} className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <input
              id="firstName"
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full p-3 pl-10 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="relative">
            <label htmlFor="lastName" className="sr-only">Last Name</label>
            <FontAwesomeIcon icon={faUser} className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <input
              id="lastName"
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full p-3 pl-10 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="relative">
            <label htmlFor="gender" className="sr-only">Gender</label>
            <FontAwesomeIcon icon={faTransgenderAlt} className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="w-full p-3 pl-10 pr-8 rounded-md text-white bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-600 appearance-none"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          <div className="relative">
            <label htmlFor="email" className="sr-only">Email Address</label>
            <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <input
              id="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 pl-10 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="sr-only">Password</label>
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 pl-10 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-gray-500" />
            </button>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 pl-10 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="text-gray-500" />
            </button>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-md hover:bg-gradient-to-r hover:from-cyan-600 hover:to-teal-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 border border-transparent shadow-md"
            disabled={loading}
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div> : 'Register'}
          </Button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/Login" className="text-teal-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;