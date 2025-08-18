import { ProfileContent } from "@/components/profile-content";

export default function ProfilePage() {
  return (
    <div className="container my-16 mx-auto max-w-4xl py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <ProfileContent />
    </div>
  );
}
