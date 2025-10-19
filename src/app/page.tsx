export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-yellow rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Alright</h1>
                <p className="text-gray-600">Field Service Management Platform</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <a
                href="/complaint"
                className="btn-primary px-6 py-2"
              >
                Submit Request
              </a>
              <a
                href="/test-login"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Test Login
              </a>
              <a
                href="/dashboard"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Manager Login
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Professional Field Service Management
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with skilled technicians for all your home and business service needs. 
            Track your requests in real-time and get quality service when you need it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/complaint"
              className="btn-primary px-8 py-4 text-lg"
            >
              Submit Service Request
            </a>
            <a
              href="/test-login"
              className="px-8 py-4 text-lg bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Test the Platform
            </a>
            <a
              href="/track"
              className="px-8 py-4 text-lg border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Track Your Request
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-black font-bold text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Response</h3>
            <p className="text-gray-600">
              Get connected with qualified technicians within hours of submitting your request.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-black font-bold text-2xl">📍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Tracking</h3>
            <p className="text-gray-600">
              Track your technician's location in real-time and know exactly when they'll arrive.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-black font-bold text-2xl">🔧</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Technicians</h3>
            <p className="text-gray-600">
              Skilled professionals with verified credentials for all your service needs.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-yellow py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-black mb-8">
            Submit your service request today and experience professional field service management.
          </p>
          <a
            href="/complaint"
            className="bg-black text-white px-8 py-4 text-lg rounded-md hover:bg-gray-800 transition-colors"
          >
            Submit Request Now
          </a>
        </div>
      </div>
    </div>
  )
}