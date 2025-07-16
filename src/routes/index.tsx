
import { createBrowserRouter } from "react-router-dom";
import Layout from "@/pages/Layout";
import Users from "@/pages/projects/Users";
import Characters from "@/pages/projects/Characters";
import Resources from "@/pages/projects/Resources";
import Missions from "@/pages/projects/Missions";
import StakingRewards from "@/pages/projects/StakingRewards";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Users />,
      },
      {
        path: "projects",
        children: [
          {
            path: "users",
            element: <Users />,
          },
          {
            path: "characters",
            element: <Characters />,
          },
          {
            path: "resources",
            element: <Resources />,
          },
          {
            path: "missions",
            element: <Missions />,
          },
          {
            path: "staking-rewards",
            element: <StakingRewards />,
          },
        ],
      },
    ],
  },
]);
