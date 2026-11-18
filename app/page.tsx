import { ProfileSidebar } from "@/components/wall/profile-sidebar";
import { WallMain } from "@/components/wall/wall-main";

export default function Home() {
  return (
    <div className="min-h-dvh bg-gray-50 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-5xl overflow-hidden bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-xl">
        <header className="bg-blue-500 px-4 py-3 md:px-6">
          <span className="text-xl font-bold tracking-tight text-white">wall</span>
        </header>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-72 md:shrink-0">
            <ProfileSidebar />
          </div>
          <WallMain />
        </div>
      </div>
    </div>
  );
}
