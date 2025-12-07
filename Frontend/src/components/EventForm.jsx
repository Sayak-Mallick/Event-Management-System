import React, { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { timezones } from '../utils/timezones'
import 'react-datepicker/dist/react-datepicker.css'

dayjs.extend(utc)
dayjs.extend(timezone)

const EventForm = ({ event, onClose, onSuccess }) => {
    const { profiles, currentProfile, createEvent, updateEvent } = useStore()
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        profiles: [],
        timezone: null,
        startDateTime: new Date(),
        // eslint-disable-next-line react-hooks/purity
        endDateTime: new Date(Date.now() + 3600000), // 1 hour later
    })
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (event) {
            // Editing existing event
            const eventTimezone = timezones.find(
                (tz) => tz.value === event.timezone
            )
            setFormData({
                title: event.title,
                description: event.description || '',
                profiles: event.profiles.map((p) => ({
                    value: p._id,
                    label: p.name,
                })),
                timezone: eventTimezone,
                startDateTime: dayjs(event.startDateTime)
                    .tz(event.timezone)
                    .toDate(),
                endDateTime: dayjs(event.endDateTime)
                    .tz(event.timezone)
                    .toDate(),
            })
        } else if (currentProfile) {
            // Creating new event with current profile pre-selected
            const profileTimezone = timezones.find(
                (tz) => tz.value === currentProfile.timezone
            )
            setFormData((prev) => ({
                ...prev,
                profiles: [
                    { value: currentProfile._id, label: currentProfile.name },
                ],
                timezone: profileTimezone,
            }))
        }
    }, [event, currentProfile])

    const validateForm = () => {
        const newErrors = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required'
        }

        if (formData.profiles.length === 0) {
            newErrors.profiles = 'Select at least one profile'
        }

        if (!formData.timezone) {
            newErrors.timezone = 'Timezone is required'
        }

        if (formData.endDateTime <= formData.startDateTime) {
            newErrors.endDateTime =
                'End date/time must be after start date/time'
        }

        const now = new Date()
        if (formData.endDateTime < now) {
            newErrors.endDateTime = 'End date/time cannot be in the past'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            const eventData = {
                title: formData.title,
                description: formData.description,
                profiles: formData.profiles.map((p) => p.value),
                timezone: formData.timezone.value,
                startDateTime: dayjs(formData.startDateTime)
                    .tz(formData.timezone.value)
                    .format(),
                endDateTime: dayjs(formData.endDateTime)
                    .tz(formData.timezone.value)
                    .format(),
                createdBy: currentProfile?._id || formData.profiles[0].value,
            }

            if (event) {
                // Update existing event
                eventData.updatedBy =
                    currentProfile?._id || formData.profiles[0].value
                eventData.userTimezone =
                    currentProfile?.timezone || formData.timezone.value
                await updateEvent(event._id, eventData)
            } else {
                // Create new event
                await createEvent(eventData)
            }

            if (onSuccess) onSuccess()
            if (onClose) onClose()
        } catch (error) {
            console.error('Error saving event:', error)
            setErrors({
                submit: error.response?.data?.message || 'Failed to save event',
            })
        }
    }

    const profileOptions = profiles.map((p) => ({
        value: p._id,
        label: p.name,
    }))

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h2 className="modal-title">
                    {event ? 'Edit Event' : 'Create New Event'}
                </h2>

                <form onSubmit={handleSubmit} className="form">
                    {/* Title */}
                    <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    title: e.target.value,
                                })
                            }
                            className={`input ${
                                errors.title ? 'input-error' : ''
                            }`}
                            placeholder="Event title"
                        />
                        {errors.title && (
                            <p className="error-text">{errors.title}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            className="textarea"
                            placeholder="Event description"
                            rows="3"
                        />
                    </div>

                    {/* Profiles */}
                    <div className="form-group">
                        <label className="form-label">Profiles *</label>
                        <Select
                            isMulti
                            value={formData.profiles}
                            onChange={(selected) =>
                                setFormData({
                                    ...formData,
                                    profiles: selected || [],
                                })
                            }
                            options={profileOptions}
                            className={errors.profiles ? 'select-error' : ''}
                            classNamePrefix="select"
                            placeholder="Select profiles..."
                        />
                        {errors.profiles && (
                            <p className="error-text">{errors.profiles}</p>
                        )}
                    </div>

                    {/* Timezone */}
                    <div className="form-group">
                        <label className="form-label">Timezone *</label>
                        <Select
                            value={formData.timezone}
                            onChange={(selected) =>
                                setFormData({ ...formData, timezone: selected })
                            }
                            options={timezones}
                            className={errors.timezone ? 'select-error' : ''}
                            classNamePrefix="select"
                            placeholder="Select timezone..."
                        />
                        {errors.timezone && (
                            <p className="error-text">{errors.timezone}</p>
                        )}
                    </div>

                    {/* Start Date/Time */}
                    <div className="form-group">
                        <label className="form-label">
                            Start Date & Time *
                        </label>
                        <DatePicker
                            selected={formData.startDateTime}
                            onChange={(date) =>
                                setFormData({
                                    ...formData,
                                    startDateTime: date,
                                })
                            }
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="input"
                        />
                    </div>

                    {/* End Date/Time */}
                    <div className="form-group">
                        <label className="form-label">End Date & Time *</label>
                        <DatePicker
                            selected={formData.endDateTime}
                            onChange={(date) =>
                                setFormData({ ...formData, endDateTime: date })
                            }
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            minDate={formData.startDateTime}
                            className={`input ${
                                errors.endDateTime ? 'input-error' : ''
                            }`}
                        />
                        {errors.endDateTime && (
                            <p className="error-text">{errors.endDateTime}</p>
                        )}
                    </div>

                    {/* Error Message */}
                    {errors.submit && (
                        <div className="submit-error">{errors.submit}</div>
                    )}

                    {/* Buttons */}
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">
                            {event ? 'Update Event' : 'Create Event'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EventForm
