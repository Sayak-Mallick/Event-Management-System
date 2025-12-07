import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import EventForm from './EventForm';

dayjs.extend(utc);
dayjs.extend(timezone);

const EventList = () => {
  const { events, currentProfile, fetchEvents, deleteEvent } = useStore();
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showUpdateLogs, setShowUpdateLogs] = useState(null);

  useEffect(() => {
    if (currentProfile) {
      fetchEvents(currentProfile._id);
    }
  }, [currentProfile, fetchEvents]);

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const formatDateTime = (date, tz) => {
    return dayjs(date).tz(tz).format('MMM DD, YYYY h:mm A');
  };

  const formatUpdateLog = (log, eventTimezone) => {
    const userTz = currentProfile?.timezone || eventTimezone;
    return dayjs(log.updatedAt).tz(userTz).format('MMM DD, YYYY h:mm A');
  };

  const getChangeDisplay = (change, eventTimezone) => {
    const userTz = currentProfile?.timezone || eventTimezone;
    
    if (change.field === 'startDateTime' || change.field === 'endDateTime') {
      return {
        field: change.field === 'startDateTime' ? 'Start Date/Time' : 'End Date/Time',
        oldValue: dayjs(change.oldValue).tz(userTz).format('MMM DD, YYYY h:mm A'),
        newValue: dayjs(change.newValue).tz(userTz).format('MMM DD, YYYY h:mm A')
      };
    }

    return {
      field: change.field.charAt(0).toUpperCase() + change.field.slice(1),
      oldValue: String(change.oldValue),
      newValue: String(change.newValue)
    };
  };

  if (!currentProfile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500">Select a profile to view events</p>
      </div>
    );
  }

  const userTimezone = currentProfile.timezone;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Events for {currentProfile.name}
          </h2>
          <p className="text-sm text-gray-600">Timezone: {userTimezone}</p>
        </div>
        <button
          onClick={() => {
            setSelectedEvent(null);
            setShowEventForm(true);
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
        >
          + Create Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No events yet</p>
          <p className="text-sm">Create your first event to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">{event.title}</h3>
                  {event.description && (
                    <p className="text-gray-600 mt-1">{event.description}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded border border-blue-500 hover:bg-blue-50 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="text-red-500 hover:text-red-700 px-3 py-1 rounded border border-red-500 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span className="font-medium text-gray-700">Start:</span>
                  <p className="text-gray-600">{formatDateTime(event.startDateTime, userTimezone)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">End:</span>
                  <p className="text-gray-600">{formatDateTime(event.endDateTime, userTimezone)}</p>
                </div>
              </div>

              <div className="mb-3">
                <span className="font-medium text-gray-700 text-sm">Assigned to:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {event.profiles.map((profile) => (
                    <span
                      key={profile._id}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {profile.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-500 border-t pt-2">
                <p>Created: {formatDateTime(event.createdAt, userTimezone)}</p>
                {event.updatedAt !== event.createdAt && (
                  <p>Last Updated: {formatDateTime(event.updatedAt, userTimezone)}</p>
                )}
              </div>

              {/* Update Logs */}
              {event.updateLogs && event.updateLogs.length > 0 && (
                <div className="mt-3 border-t pt-3">
                  <button
                    onClick={() => setShowUpdateLogs(showUpdateLogs === event._id ? null : event._id)}
                    className="text-blue-500 hover:text-blue-700 text-sm underline"
                  >
                    {showUpdateLogs === event._id ? 'Hide' : 'Show'} Update History ({event.updateLogs.length})
                  </button>

                  {showUpdateLogs === event._id && (
                    <div className="mt-3 space-y-3">
                      {event.updateLogs.map((log, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                          <p className="font-medium text-gray-700 mb-2">
                            Updated by {log.updatedBy?.name || 'Unknown'} on {formatUpdateLog(log, event.timezone)}
                          </p>
                          <div className="space-y-2">
                            {log.changes.map((change, changeIndex) => {
                              const display = getChangeDisplay(change, event.timezone);
                              return (
                                <div key={changeIndex} className="pl-3 border-l-2 border-blue-300">
                                  <p className="font-medium text-gray-600">{display.field}:</p>
                                  <p className="text-gray-500">
                                    <span className="line-through">{display.oldValue}</span>
                                    {' → '}
                                    <span className="text-green-600">{display.newValue}</span>
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
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
            setShowEventForm(false);
            setSelectedEvent(null);
          }}
          onSuccess={() => {
            fetchEvents(currentProfile._id);
          }}
        />
      )}
    </div>
  );
};

export default EventList;
