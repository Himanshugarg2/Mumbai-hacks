// frontend/src/Pages/Landing.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Shield, 
  Users, 
  DollarSign,
  ArrowRight,
  CheckCircle,
  Sparkles,
  BarChart3,
  Wallet,
  MessageCircle
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: "AI Cashflow Prediction",
      description: "Predict your monthly income and expenses using advanced AI",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Target,
      title: "Dream Planner",
      description: "Set financial goals and get AI-generated step-by-step savings plans",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Smart Spend Guardian",
      description: "Real-time spending alerts and daily budget recommendations",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Investment Portfolio",
      description: "Personalized portfolio allocation based on your risk appetite and goals",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Opportunity Scout",
      description: "Find high-earning locations and peak demand times in real-time",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: MessageCircle,
      title: "AI Finance Coach",
      description: "24/7 chatbot for investment advice, tax planning, and money questions",
      color: "from-pink-500 to-rose-500"
    }
  ];

  const gigTypes = [
    { name: "Delivery Partners", icon: "🛵" },
    { name: "Ride Partners", icon: "🚗" },
    { name: "Freelancers", icon: "💻" },
    { name: "Local Services", icon: "🔧" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Kuber
            </span>
          </div>
          
          <button
            onClick={() => navigate("/auth")}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Get Started →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Smart Money
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                for Gig Workers
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              India's first AI-powered financial platform designed exclusively for delivery partners, 
              ride-sharers, freelancers, and gig economy heroes.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/auth")}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                Start Free Today
                <ArrowRight className="h-5 w-5" />
              </button>
              
              {/* <button className="px-8 py-4 bg-white text-gray-700 rounded-xl font-bold text-lg border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200">
                Watch Demo
              </button> */}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600 font-medium">100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600 font-medium">No Hidden Charges</span>
              </div>
              {/* <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600 font-medium">Bank-Level Security</span>
              </div> */}
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            {/* Floating Cards */}
            <div className="relative w-full h-[600px]">
              
              {/* Card 1 - Cashflow */}
              <div className="absolute top-0 right-0 w-80 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 animate-float">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Cashflow Prediction</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expected Income</span>
                    <span className="font-bold text-green-600">₹45,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expected Expense</span>
                    <span className="font-bold text-red-600">₹38,000</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    💰 You'll save ₹7,000 this month
                  </p>
                </div>
              </div>

              {/* Card 2 - Smart Spend */}
              <div className="absolute top-40 left-0 w-72 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 animate-float-delayed">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Zap className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Today's Alert</h3>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-900">
                    ⚠️ You've spent ₹250 on food today. Your safe limit is ₹200. 
                    Consider cooking at home tonight!
                  </p>
                </div>
              </div>

              {/* Card 3 - Dream */}
              <div className="absolute bottom-0 right-10 w-72 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 animate-float">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Your Dream</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Buy Bike</span>
                    <span className="text-xs text-gray-500">5 months</span>
                  </div>
                  <div className="relative">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    </div>
                    <div className="absolute -top-1 left-2/3 transform -translate-x-1/2">
                      <div className="w-5 h-5 bg-purple-600 rounded-full border-2 border-white shadow"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>₹33,000 saved</span>
                    <span>₹50,000 goal</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Who We Serve */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for India's Gig Heroes</h2>
          <p className="text-xl text-gray-600">Take control of your finances with intelligent tools</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gigTypes.map((gig, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-200 text-center">
              <div className="text-5xl mb-4">{gig.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{gig.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">AI-Powered Features</h2>
          <p className="text-xl text-gray-600">Everything you need to master your money</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-2xl transition-all duration-200 group">
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Take Control of Your Money?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Start building wealth with AI-powered financial insights designed for gig workers
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="px-10 py-5 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 inline-flex items-center gap-3"
          >
            Start Your Journey Free
            <ArrowRight className="h-6 w-6" />
          </button>
          <p className="text-indigo-200 text-sm mt-4">No credit card required • Setup in 2 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Kuber</span>
          </div>
          <p className="mb-6">Empowering India's gig economy, one worker at a time.</p>
          <p className="text-sm">© 2025 Kuber. All rights reserved. Made with ❤️ in India</p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1s;
        }
      `}</style>
    </div>
  );
}