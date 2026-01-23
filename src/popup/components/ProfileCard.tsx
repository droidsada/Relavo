import type { ProfileData } from '../../shared/types';

interface ProfileCardProps {
  profileData: ProfileData | null;
  isLoading: boolean;
  isOnLinkedIn: boolean;
}

export default function ProfileCard({ profileData, isLoading, isOnLinkedIn }: ProfileCardProps) {
  if (!isOnLinkedIn) {
    return (
      <div className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
        <p className="text-sm text-yellow-800">
          Navigate to a LinkedIn profile page (linkedin.com/in/...) to extract profile data.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">
        <p className="text-sm text-red-800">
          Could not extract profile data. Please make sure you're on a LinkedIn profile page and refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Profile Data</h2>
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium text-gray-700">Name:</span>
          <span className="ml-2 text-gray-600">{profileData.name}</span>
        </div>
        {profileData.headline && (
          <div>
            <span className="font-medium text-gray-700">Headline:</span>
            <span className="ml-2 text-gray-600">{profileData.headline}</span>
          </div>
        )}
        {profileData.location && (
          <div>
            <span className="font-medium text-gray-700">Location:</span>
            <span className="ml-2 text-gray-600">{profileData.location}</span>
          </div>
        )}
        {profileData.about && (
          <div>
            <span className="font-medium text-gray-700">About:</span>
            <span className="ml-2 text-gray-600">
              {profileData.about.length > 100
                ? `${profileData.about.substring(0, 100)}...`
                : profileData.about}
            </span>
          </div>
        )}
        {profileData.experience.length > 0 && (
          <div>
            <span className="font-medium text-gray-700">Experience:</span>
            <div className="ml-4 mt-1 space-y-1">
              {profileData.experience.slice(0, 3).map((exp, idx) => (
                <div key={idx} className="text-gray-600">
                  - {exp}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
