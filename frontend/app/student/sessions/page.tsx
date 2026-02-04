'use client';

export default function SessionsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Your Sessions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder session cards */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">React Fundamentals</h3>
            <p className="text-slate-400 text-sm mb-4">
              Session with Expert Tutor
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">45 min • $6.75</span>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
                Reschedule
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Book a Session</h2>
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
          <p className="text-slate-400 mb-4">
            Ready to learn? Book a session with one of our expert tutors.
          </p>
          <button className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors">
            Browse Tutors
          </button>
        </div>
      </div>
    </div>
  );
}
