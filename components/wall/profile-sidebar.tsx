import { profile } from "@/lib/profile";

function ProfilePhoto() {
  if (profile.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.photo}
        alt={profile.name}
        className="size-full rounded-xl object-cover"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={profile.name}
      className="flex size-full items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 text-white shadow-inner"
    >
      <span className="text-3xl font-semibold tracking-wide drop-shadow-sm md:text-6xl">
        {profile.initials}
      </span>
    </div>
  );
}

export function ProfileSidebar() {
  return (
    <aside className="flex gap-4 border-b border-gray-200 p-4 md:flex-col md:gap-0 md:border-b-0 md:border-r md:p-6">
      <div className="size-24 shrink-0 md:aspect-[4/5] md:size-auto md:w-full">
        <ProfilePhoto />
      </div>

      <div className="min-w-0 md:mt-5">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">{profile.name}</h1>
        <p className="text-gray-500 md:text-lg">wall</p>

        <div className="mt-3 md:mt-6">
          <span className="inline-block rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
            Information
          </span>

          <dl className="mt-3 space-y-3 text-sm md:mt-5">
            <div>
              <dt className="font-medium text-gray-900">Networks</dt>
              <dd className="text-gray-600">{profile.networks}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Current City</dt>
              <dd className="text-gray-600">{profile.currentCity}</dd>
            </div>
          </dl>
        </div>
      </div>
    </aside>
  );
}
