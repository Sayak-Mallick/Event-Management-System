import React, { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import Select from 'react-select'
import { timezones } from '../utils/timezones'

const ProfileList = ({ onSelectProfile }) => {
    const {
        profiles,
        fetchProfiles,
        createProfile,
        updateProfileTimezone,
        currentProfile,
        setCurrentProfile,
    } = useStore()
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newProfileName, setNewProfileName] = useState('')
    const [newProfileTimezone, setNewProfileTimezone] = useState(timezones[0])
    const [showTimezoneModal, setShowTimezoneModal] = useState(false)
    const [selectedTimezone, setSelectedTimezone] = useState(null)

    useEffect(() => {
        fetchProfiles()
    }, [fetchProfiles])

    const handleCreateProfile = async (e) => {
        e.preventDefault()
        if (!newProfileName.trim()) return

        try {
            await createProfile({
                name: newProfileName,
                timezone: newProfileTimezone.value,
            })
            setNewProfileName('')
            setNewProfileTimezone(timezones[0])
            setShowCreateForm(false)
        } catch (error) {
            console.error('Error creating profile:', error)
        }
    }

    const handleSelectProfile = (profile) => {
        setCurrentProfile(profile)
        if (onSelectProfile) {
            onSelectProfile(profile)
        }
    }

    const handleChangeTimezone = async () => {
        if (!currentProfile || !selectedTimezone) return

        try {
            await updateProfileTimezone(
                currentProfile._id,
                selectedTimezone.value
            )
            setShowTimezoneModal(false)
            setSelectedTimezone(null)
        } catch (error) {
            console.error('Error updating timezone:', error)
        }
    }

    const openTimezoneModal = (profile) => {
        const currentTz = timezones.find((tz) => tz.value === profile.timezone)
        setSelectedTimezone(currentTz)
        setShowTimezoneModal(true)
    }

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Profiles</h2>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="btn-create"
                >
                    {showCreateForm ? 'Cancel' : '+ Create Profile'}
                </button>
            </div>

            {showCreateForm && (
                <form onSubmit={handleCreateProfile} className="profile-form">
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            className="input"
                            placeholder="Enter profile name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Timezone</label>
                        <Select
                            value={newProfileTimezone}
                            onChange={setNewProfileTimezone}
                            options={timezones}
                            className="basic-select"
                            classNamePrefix="select"
                        />
                    </div>
                    <button type="submit" className="btn-primary full">
                        Create Profile
                    </button>
                </form>
            )}

            {profiles.length === 0 ? (
                <div className="empty-state">
                    <p className="text-lg">No profiles yet</p>
                    <p className="muted">
                        Create your first profile to get started
                    </p>
                </div>
            ) : (
                <div className="profile-list">
                    {profiles.map((profile) => (
                        <div
                            key={profile._id}
                            className={`profile-item ${
                                currentProfile?._id === profile._id
                                    ? 'selected'
                                    : ''
                            }`}
                            onClick={() => handleSelectProfile(profile)}
                        >
                            <div className="profile-main">
                                <div>
                                    <h3 className="profile-name">
                                        {profile.name}
                                    </h3>
                                    <p className="muted small">
                                        {profile.timezone}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleSelectProfile(profile)
                                        openTimezoneModal(profile)
                                    }}
                                    className="link-btn small"
                                >
                                    Change Timezone
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Timezone Change Modal */}
            {showTimezoneModal && (
                <div className="modal-overlay">
                    <div className="modal-card small-modal">
                        <h3 className="modal-title">Change Timezone</h3>
                        <div className="form-group">
                            <label className="form-label">
                                Select New Timezone
                            </label>
                            <Select
                                value={selectedTimezone}
                                onChange={setSelectedTimezone}
                                options={timezones}
                                className="basic-select"
                                classNamePrefix="select"
                            />
                        </div>
                        <div className="form-actions">
                            <button
                                onClick={handleChangeTimezone}
                                className="btn-primary"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => setShowTimezoneModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfileList
