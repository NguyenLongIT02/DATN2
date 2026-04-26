import { Col } from "antd";
import AppPageMeta from "@crema/components/AppPageMeta";
import AppRowContainer from "@crema/components/AppRowContainer";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import AppLoader from "@crema/components/AppLoader";
import AppAnimate from "@crema/components/AppAnimate";
import TaskCompletionChart from "./TaskCompletionChart";
import TeamProductivityChart from "./TeamProductivityChart";
import BoardAnalytics from "./BoardAnalytics";
import StatsCards from "./StatsCards";
import RecentActivities from "./RecentActivities";
import UpcomingDeadlines from "./UpcomingDeadlines";
import { useEffect } from "react";

type ReportsDataType = {
  statsCards: any[];
  taskCompletionData: any[];
  taskDistribution: any[];
  boardAnalytics: any[];
  recentActivities: any[];
  upcomingDeadlines: any[];
};

const Reports = () => {
  const [{ apiData: reportsData, loading }, { reCallAPI }] =
    useGetDataApi<ReportsDataType>("/api/reports/data");

  // Listen for storage changes to refresh data when scrumboard data changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "scrumboard_boards" || e.key === "board_members") {
        console.log("Reports: Storage changed, refreshing data...");
        if (reCallAPI) {
          reCallAPI();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events from the same tab
    const handleCustomStorageChange = () => {
      console.log("Reports: Custom storage event, refreshing data...");
      if (reCallAPI) {
        reCallAPI();
      }
    };

    window.addEventListener("scrumboardDataChanged", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "scrumboardDataChanged",
        handleCustomStorageChange
      );
    };
  }, [reCallAPI]);

  return (
    <>
      <AppPageMeta title="Reports & Analytics" />
      {loading ? (
        <AppLoader />
      ) : (
        <AppAnimate animation="transition.slideUpIn" delay={200}>
          <AppRowContainer interval={120} ease={"easeInSine"}>
            <Col xs={24} key="stats">
              <StatsCards data={reportsData?.statsCards || []} />
            </Col>

            <Col xs={24} lg={16} key="task-completion">
              <TaskCompletionChart
                data={reportsData?.taskCompletionData || []}
              />
            </Col>
            <Col xs={24} lg={8} key="task-distribution">
              <TeamProductivityChart
                data={reportsData?.taskDistribution || []}
              />
            </Col>

            <Col xs={24} key="board-analytics">
              <BoardAnalytics data={reportsData?.boardAnalytics || []} />
            </Col>

            <Col xs={24} lg={12} className="mb-0" key="recent-activities">
              <RecentActivities data={reportsData?.recentActivities || []} />
            </Col>
            <Col xs={24} lg={12} key="upcoming-deadlines">
              <UpcomingDeadlines data={reportsData?.upcomingDeadlines || []} />
            </Col>
          </AppRowContainer>
        </AppAnimate>
      )}
    </>
  );
};

export default Reports;
