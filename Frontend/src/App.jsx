import React from 'react'
import ProfileList from './components/ProfileList'
import EventList from './components/EventList'
import './App.css'

function App() {
    return (
        <div className="page">
            <header className="site-header">
                <div className="site-header-inner">
                    <h1 className="site-title">Event Management System</h1>
                    <p className="site-sub">
                        Manage events across multiple profiles and timezones
                    </p>
                </div>
            </header>

            <main className="site-main">
                <div className="layout">
                    <aside className="sidebar">
                        <ProfileList />
                    </aside>
                    <section className="content">
                        <EventList />
                    </section>
                </div>
            </main>
        </div>
    )
}

export default App
