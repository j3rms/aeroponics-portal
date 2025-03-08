import Link from "next/link";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-red-800">Forgot Password</h2>
        <p className="mt-4 text-center text-gray-600">
          Enter your email address, and we'll send you a link to reset your password.
        </p>

        <form className="mt-8 space-y-6" action="#" method="POST">
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-800 focus:border-red-800 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-red-800 text-white font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-800"
            >
              Send Reset Link
            </button>
          </div>
        </form>

        {/* Return to Login Link */}
        <div className="mt-6 text-center">
          <Link href="/login">
            <span className="text-sm text-red-800 hover:underline">Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
