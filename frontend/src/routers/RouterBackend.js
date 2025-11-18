import React from "react";
import LayoutAdmin from "../layouts/index";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/users/login";
import Register from "../pages/users/register";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/authService";

import User from "../pages/users";
import Role from "../pages/users/roles";

import CreateUser from "../pages/users/create";

import Device from "../pages/devices";
import DeviceConfigurations from "../pages/device_configurations";

import CreateDeviceConfiguration from "../pages/device_configurations/create";
import EditDevice from "../pages/devices/edit";

import EditDeviceConfiguration from "../pages/device_configurations/edit";
import ShowDeviceConfiguration from "../pages/device_configurations/show";
import ShowDeploymentLog from "../pages/deployment_logs/show";
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

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const RouterBackend = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/*", element: <NotFound /> },
  { path: "/ticket/create", element: <TicketCreate /> },
  { path: "/ticket/queue_display", element: <QueueDisplay /> },
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

      // --- Users ---
      { path: "/users", element: <User /> },
      { path: "/user/create", element: <CreateUser /> },
      { path: "/user/show/:id", element: <CreateUser /> }, //
      { path: "/user/edit/:id", element: <CreateUser /> }, //
      { path: "/roles", element: <Role /> }, //

      // --- Devices ---
      { path: "/devices", element: <Device /> },
      { path: "/device/edit/:id", element: <EditDevice /> },

      // --- Device Configurations ---
      { path: "/device_configurations", element: <DeviceConfigurations /> },
      {
        path: "/device_configuration/create",
        element: <CreateDeviceConfiguration />,
      },
      {
        path: "/device_configuration/edit/:id",
        element: <EditDeviceConfiguration />,
      },
      {
        path: "/device_configuration/show/:id",
        element: <ShowDeviceConfiguration />,
      },

      // --- Monitoring ---
      { path: "/monitoring", element: <Device /> },
      { path: "/monitoring/edit/:id", element: <Device /> },

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
