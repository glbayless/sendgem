import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            SendGem
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            AI-Powered Cold Email Campaigns That Actually Get Replies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard/onboarding"
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-semibold text-lg hover:scale-105 transition-transform"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold mb-4 text-pink-400">🤖 AI Smart Writing</h3>
            <p className="text-gray-300">Our AI analyzes your prospect's website and creates personalized emails that sound human-written.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold mb-4 text-purple-400">📥 Built-in Intake Forms</h3>
            <p className="text-gray-300">Share a beautiful intake form with your clients to collect everything you need in one place.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold mb-4 text-cyan-400">📊 Campaign Analytics</h3>
            <p className="text-gray-300">Track opens, clicks, and replies. See which campaigns perform best and optimize accordingly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}