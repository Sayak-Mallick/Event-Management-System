import React, { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import EventForm from './EventForm'

dayjs.extend(utc)
dayjs.extend(timezone)

const EventList = () => {
    const { events, currentProfile, fetchEvents, deleteEvent } = useStore()
    const [showEventForm, setShowEventForm] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [showUpdateLogs, setShowUpdateLogs] = useState(null)

    useEffect(() => {
        if (currentProfile) {
            fetchEvents(currentProfile._id)
        }
    }, [currentProfile, fetchEvents])

    const handleEditEvent = (event) => {
        setSelectedEvent(event)
        setShowEventForm(true)
    }

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await deleteEvent(eventId)
            } catch (error) {
                console.error('Error deleting event:', error)
            }
        }
    }

    const formatDateTime = (date, tz) => {
        return dayjs(date).tz(tz).format('MMM DD, YYYY h:mm A')
    }

    const formatUpdateLog = (log, eventTimezone) => {
        const userTz = currentProfile?.timezone || eventTimezone
        return dayjs(log.updatedAt).tz(userTz).format('MMM DD, YYYY h:mm A')
    }

    const getChangeDisplay = (change, eventTimezone) => {
        const userTz = currentProfile?.timezone || eventTimezone

        if (
            change.field === 'startDateTime' ||
            change.field === 'endDateTime'
        ) {
            return {
                field:
                    change.field === 'startDateTime'
                        ? 'Start Date/Time'
                        : 'End Date/Time',
                oldValue: dayjs(change.oldValue)
                    .tz(userTz)
                    .format('MMM DD, YYYY h:mm A'),
                newValue: dayjs(change.newValue)
                    .tz(userTz)
                    .format('MMM DD, YYYY h:mm A'),
            }
        }

        return {
            field: change.field.charAt(0).toUpperCase() + change.field.slice(1),
            oldValue: String(change.oldValue),
            newValue: String(change.newValue),
        }
    }

    if (!currentProfile) {
        return (
            <div className="card">
                <p className="muted center">Select a profile to view events</p>
            </div>
        )
    }

    const userTimezone = currentProfile.timezone

    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <h2 className="card-title">
                        Events for {currentProfile.name}
                    </h2>
                    <p className="muted">Timezone: {userTimezone}</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedEvent(null)
                        setShowEventForm(true)
                    }}
                    className="btn-create"
                >
                    + Create Event
                </button>
            </div>

            {events.length === 0 ? (
                <div className="empty-state">
                    <p className="text-lg">No events yet</p>
                    <p className="muted">
                        Create your first event to get started
                    </p>
                </div>
            ) : (
                <div className="events-list">
                    {events.map((event) => (
                        <div key={event._id} className="event-card">
                            <div className="event-header">
                                <div className="event-main">
                                    <h3 className="event-title">
                                        {event.title}
                                    </h3>
                                    {event.description && (
                                        <p className="muted">
                                            {event.description}
                                        </p>
                                    )}
                                </div>
                                <div className="event-actions">
                                    <button
                                        onClick={() => handleEditEvent(event)}
                                        className="link-btn"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteEvent(event._id)
                                        }
                                        className="link-btn danger"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="event-dates">
                                <div>
                                    <span className="label">Start:</span>
                                    <p className="muted small">
                                        {formatDateTime(
                                            event.startDateTime,
                                            userTimezone
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <span className="label">End:</span>
                                    <p className="muted small">
                                        {formatDateTime(
                                            event.endDateTime,
                                            userTimezone
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="assigned">
                                <span className="label small">
                                    Assigned to:
                                </span>
                                <div className="chips">
                                    {event.profiles.map((profile) => (
                                        <span
                                            key={profile._id}
                                            className="chip"
                                        >
                                            {profile.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="meta">
                                <p>
                                    Created:{' '}
                                    {formatDateTime(
                                        event.createdAt,
                                        userTimezone
                                    )}
                                </p>
                                {event.updatedAt !== event.createdAt && (
                                    <p>
                                        Last Updated:{' '}
                                        {formatDateTime(
                                            event.updatedAt,
                                            userTimezone
                                        )}
                                    </p>
                                )}
                            </div>

                            {/* Update Logs */}
                            {event.updateLogs &&
                                event.updateLogs.length > 0 && (
                                    <div className="update-section">
                                        <button
                                            onClick={() =>
                                                setShowUpdateLogs(
                                                    showUpdateLogs === event._id
                                                        ? null
                                                        : event._id
                                                )
                                            }
                                            className="link-toggle"
                                        >
                                            {showUpdateLogs === event._id
                                                ? 'Hide'
                                                : 'Show'}{' '}
                                            Update History (
                                            {event.updateLogs.length})
                                        </button>

                                        {showUpdateLogs === event._id && (
                                            <div className="update-list">
                                                {event.updateLogs.map(
                                                    (log, index) => (
                                                        <div
                                                            key={index}
                                                            className="update-item"
                                                        >
                                                            <p className="update-meta">
                                                                Updated by{' '}
                                                                {log.updatedBy
                                                                    ?.name ||
                                                                    'Unknown'}{' '}
                                                                on{' '}
                                                                {formatUpdateLog(
                                                                    log,
                                                                    event.timezone
                                                                )}
                                                            </p>
                                                            <div className="update-changes">
                                                                {log.changes.map(
                                                                    (
                                                                        change,
                                                                        changeIndex
                                                                    ) => {
                                                                        const display =
                                                                            getChangeDisplay(
                                                                                change,
                                                                                event.timezone
                                                                            )
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    changeIndex
                                                                                }
                                                                                className="change-row"
                                                                            >
                                                                                <p className="change-field">
                                                                                    {
                                                                                        display.field
                                                                                    }

                                                                                    :
                                                                                </p>
                                                                                <p className="change-values">
                                                                                    <span className="change-old">
                                                                                        {
                                                                                            display.oldValue
                                                                                        }
                                                                                    </span>
                                                                                    {
                                                                                        ' → '
                                                                                    }
                                                                                    <span className="change-new">
                                                                                        {
                                                                                            display.newValue
                                                                                        }
                                                                                    </span>
                                                                                </p>
                                                                            </div>
                                                                        )
                                                                    }
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
            )}

            {/* Event Form Modal */}
            {showEventForm && (
                <EventForm
                    event={selectedEvent}
                    onClose={() => {
                        setShowEventForm(false)
                        setSelectedEvent(null)
                    }}
                    onSuccess={() => {
                        fetchEvents(currentProfile._id)
                    }}
                />
            )}
        </div>
    )
}

export default EventList
