import React, { useState } from 'react';
import ChatWidget from './ChatWidget';
import AgentDashboard from './AgentDashboard';

function App() {
  const [view, setView] = useState('customer');

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      {/* View Toggle */}
      <div className="mb-8 w-full max-w-6xl flex justify-end">
        <div className="bg-white p-2 rounded-xl shadow-sm flex gap-2">
          <button 
            onClick={() => setView('customer')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${view === 'customer' ? 'bg-blue-600 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
          >
            Simulate Customer
          </button>
          <button 
            onClick={() => setView('agent')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${view === 'agent' ? 'bg-indigo-600 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
          >
            Simulate Agent
          </button>
        </div>
      </div>

      <div className="w-full max-w-6xl flex justify-center items-start">
        {view === 'customer' ? (
          <div className="w-full max-w-3xl bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
             <div className="flex justify-between items-center mb-10">
                <h1 className="text-2xl font-black text-gray-800">SneakerStore.</h1>
                <nav className="flex gap-6 text-sm font-semibold text-gray-500">
                  <span className="text-gray-900 cursor-pointer">Shop</span>
                  <span className="cursor-pointer hover:text-gray-800">Collections</span>
                  <span className="cursor-pointer hover:text-gray-800">Support</span>
                </nav>
             </div>
             
             <div className="bg-gray-50 rounded-2xl p-8 mb-8">
               <div className="h-64 flex items-center justify-center">
                 <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60" alt="Shoe" className="h-full object-cover rounded-xl shadow-lg mix-blend-multiply" />
               </div>
             </div>
             
             <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Nike Air Max 2024</h2>
                  <p className="text-gray-500 max-w-md">The ultimate sneaker for performance and style. Need help sizing? Ask our support team!</p>
                </div>
                <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 shadow-lg">Buy Now - $149</button>
             </div>
             <ChatWidget customerId={`CUST-${Math.floor(Math.random()*9000) + 1000}`} />
          </div>
        ) : (
          <AgentDashboard />
        )}
      </div>
    </div>
  );
}

export default App;
