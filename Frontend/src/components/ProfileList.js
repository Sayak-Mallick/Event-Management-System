import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import Select from 'react-select';
import { timezones } from '../utils/timezones';

const ProfileList = ({ onSelectProfile }) => {
  const { profiles, fetchProfiles, createProfile, updateProfileTimezone, currentProfile, setCurrentProfile } = useStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileTimezone, setNewProfileTimezone] = useState(timezones[0]);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    try {
      await createProfile({
        name: newProfileName,
        timezone: newProfileTimezone.value
      });
      setNewProfileName('');
      setNewProfileTimezone(timezones[0]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleSelectProfile = (profile) => {
    setCurrentProfile(profile);
    if (onSelectProfile) {
      onSelectProfile(profile);
    }
  };

  const handleChangeTimezone = async () => {
    if (!currentProfile || !selectedTimezone) return;

    try {
      await updateProfileTimezone(currentProfile._id, selectedTimezone.value);
      setShowTimezoneModal(false);
      setSelectedTimezone(null);
    } catch (error) {
      console.error('Error updating timezone:', error);
    }
  };

  const openTimezoneModal = (profile) => {
    const currentTz = timezones.find(tz => tz.value === profile.timezone);
    setSelectedTimezone(currentTz);
    setShowTimezoneModal(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Profiles</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
        >
          {showCreateForm ? 'Cancel' : '+ Create Profile'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateProfile} className="mb-6 p-4 bg-gray-50 rounded-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter profile name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <Select
              value={newProfileTimezone}
              onChange={setNewProfileTimezone}
              options={timezones}
              className="basic-select"
              classNamePrefix="select"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
          >
            Create Profile
          </button>
        </form>
      )}

      {profiles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No profiles yet</p>
          <p className="text-sm">Create your first profile to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {profiles.map((profile) => (
            <div
              key={profile._id}
              className={`p-4 rounded-md cursor-pointer transition ${
                currentProfile?._id === profile._id
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
              onClick={() => handleSelectProfile(profile)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">{profile.name}</h3>
                  <p className="text-sm text-gray-600">{profile.timezone}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectProfile(profile);
                    openTimezoneModal(profile);
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm underline"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-xl font-bold mb-4">Change Timezone</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="flex gap-2">
              <button
                onClick={handleChangeTimezone}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
              >
                Update
              </button>
              <button
                onClick={() => setShowTimezoneModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileList;
