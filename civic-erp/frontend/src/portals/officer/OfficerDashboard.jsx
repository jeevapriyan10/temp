import Topbar from '../../components/Topbar';

export default function OfficerDashboard() {
  return (
    <>
      <Topbar title="Officer Dashboard" subtitle="Your assigned tasks and area overview" />
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No tasks yet</h2>
          <p className="text-surface-400 max-w-md">
            Tasks and complaints assigned to your working area will appear here.
            This feature will be available in Module 2.
          </p>
        </div>
      </div>
    </>
  );
}
