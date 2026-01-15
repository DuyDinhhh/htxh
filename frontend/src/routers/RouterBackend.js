import React from "react";
import LayoutAdmin from "../layouts/index";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/users/login";
import Register from "../pages/users/register";
// import { Navigate } from "react-router-dom";
// import { isAuthenticated } from "../services/authService";

import Device from "../pages/devices";
import EditDevice from "../pages/devices/edit";

// import ShowLog from "../pages/logs/show";
import ServiceManagement from "../pages/services";
import ServiceCreate from "../pages/services/create";
import ServiceEdit from "../pages/services/edit";
import FeedbackManagement from "../pages/feedbacks";
import TicketManagement from "../pages/tickets";
import TicketCreate from "../pages/tickets/create";
import QueueDisplay from "../pages/tickets/queue_display";
import ConfigEdit from "../pages/config/edit";
import ActivityLog from "../pages/logs";
import DeploymentLog from "../pages/logs/deployment";
import ButtonConfig from "../pages/config/buttonEdit";
import QRCTicketGenerator from "../pages/tickets-qr/qr";
import TicketCreateQR from "../pages/tickets-qr/create-qr";

// const ProtectedRoute = ({ children }) => {
//   return isAuthenticated() ? children : <Navigate to="/login" />;
// };

const RouterBackend = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/*", element: <NotFound /> },

  { path: "/ticket/create", element: <TicketCreate /> },
  { path: "/ticket/queue_display", element: <QueueDisplay /> },
  { path: "/ticket/qr", element: <QRCTicketGenerator /> },
  { path: "/ticket/create-qr", element: <TicketCreateQR /> },

  { path: "/config/button_config", element: <ButtonConfig /> },

  {
    path: "/",
    // element: (
    //   <ProtectedRoute>
    //     <LayoutAdmin />
    //   </ProtectedRoute>
    // ),
    element: <LayoutAdmin />,
    children: [
      { path: "", element: <Dashboard /> },
      { path: "/admin", element: <Dashboard /> },
      { path: "/dashboards", element: <Dashboard /> },

      // --- Devices ---
      { path: "/devices", element: <Device /> },
      { path: "/device/edit/:id", element: <EditDevice /> },

      // --- Logs ---
      { path: "/logs", element: <ActivityLog /> },
      { path: "/deployment_logs", element: <DeploymentLog /> },

      { path: "/tickets", element: <TicketManagement /> },
      { path: "/ticket/create", element: <TicketCreate /> },
      // --- Deployments Logs ---

      { path: "/services", element: <ServiceManagement /> },
      { path: "/service/create", element: <ServiceCreate /> },
      { path: "/service/edit/:id", element: <ServiceEdit /> },

      { path: "/feedbacks", element: <FeedbackManagement /> },
      { path: "/config", element: <ConfigEdit /> },
    ],
  },
];

export default RouterBackend;
