import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-md font-medium transition-colors inline-block"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  )
}

