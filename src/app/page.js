import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md w-full">
       
        <p className="text-gray-600 mb-6">
          Please register your account to continue using the chat application.
        </p>
        <Link
          href="/register"
          className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Register Now
        </Link>
      </div>
    </div>
  );
}