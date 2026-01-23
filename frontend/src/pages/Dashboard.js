import FeedbackChart from "../components/feedbackChart";
import TicketComparisonChart from "../components/ticketComparisonChart";
import TicketTrendChart from "../components/ticketTrendChart";

// Dashboard page: shows ticket and feedback charts
const Dashboard = () => {
  return (
    <div class="container px-6 mx-auto grid">
      <div className="flex space-x-6 mb-6">
        <div className="w-1/2">
          <TicketComparisonChart />
        </div>
        <div className="w-1/2">
          <FeedbackChart />
        </div>
      </div>
      <TicketTrendChart />
    </div>
  );
};
export default Dashboard;
