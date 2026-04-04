import AppLoadingScreen from "@/components/app/AppLoadingScreen";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[120]">
      <AppLoadingScreen
        title="Loading LogScope"
        message="We are fetching the latest data and preparing your workspace."
      />
    </div>
  );
}
