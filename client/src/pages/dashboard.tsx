import { t } from "@/lib/i18n";
import StatsCards from "@/components/dashboard/StatsCards";
import TaskChart from "@/components/dashboard/TaskChart";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks";

const Dashboard = () => {
  return (
    <>
      {/* Welcome Section */}
      <section className="mb-6 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold font-poppins mb-2">
          {t("welcome")}, zayad kabiri <span className="inline-block animate-wave">👋</span>
        </h2>
        <p className="text-neutral-600">{t("welcomeDescription")}</p>
      </section>

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TaskChart />
        <UpcomingTasks />
      </div>
    </>
  );
};

export default Dashboard;
