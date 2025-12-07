import React from 'react'
import ProfileList from './components/ProfileList'
import EventList from './components/EventList'
import './App.css'

function App() {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Event Management System
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage events across multiple profiles and timezones
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar - Profile List */}
                    <div className="lg:col-span-1">
                        <ProfileList />
                    </div>

                    {/* Main Content - Event List */}
                    <div className="lg:col-span-2">
                        <EventList />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default App
