import { createBrowserRouter, Navigate } from "react-router-dom"

import { appRoutes } from "@/app/routes"
import { DashboardRoute } from "@/routes/dashboard-page"
import { ProblemPageRoute } from "@/routes/problem-page"
import { RootLayout } from "@/routes/root-layout"

export const router = createBrowserRouter([
  {
    path: appRoutes.home,
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DashboardRoute />,
      },
      {
        path: "problems",
        children: [
          {
            path: ":problemId",
            element: <ProblemPageRoute />,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to={appRoutes.home} replace />,
      },
    ],
  },
])
