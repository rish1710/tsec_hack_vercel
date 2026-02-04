'use client';

export default function ProgressPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Your Learning Progress</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-700">
          <p className="text-blue-200 text-sm font-medium mb-2">Total Learning Time</p>
          <p className="text-4xl font-bold">12h 45m</p>
          <p className="text-blue-300 text-sm mt-2">↑ 3h this week</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-700">
          <p className="text-purple-200 text-sm font-medium mb-2">Total Spent</p>
          <p className="text-4xl font-bold">$45.20</p>
          <p className="text-purple-300 text-sm mt-2">Average: $3.55/session</p>
        </div>
      </div>

      {/* Learning Topics */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold">Topics Explored</h2>
        </div>
        <div className="divide-y divide-slate-700">
          {[
            { topic: 'React Hooks', progress: 75 },
            { topic: 'TypeScript Basics', progress: 60 },
            { topic: 'Database Design', progress: 45 },
            { topic: 'API Development', progress: 80 },
          ].map((item) => (
            <div key={item.topic} className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{item.topic}</span>
                <span className="text-sm text-slate-400">{item.progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
