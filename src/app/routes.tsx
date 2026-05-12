import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { CitizenDashboard } from "./pages/CitizenDashboard";
import { OfficerDashboard } from "./pages/OfficerDashboard";
import { ShopDashboard } from "./pages/ShopDashboard";
import { ApplicationForm } from "./pages/ApplicationForm";
import { ApplicationsList } from "./pages/ApplicationsList";
import { ApplicationDetails } from "./pages/ApplicationDetails";
import { WeaponRegistration } from "./pages/WeaponRegistration";
import { WeaponRegistry } from "./pages/WeaponRegistry";
import { DecisionPage } from "./pages/DecisionPage";
import { ShopVerification } from "./pages/ShopVerification";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LoginPage },
      { path: "citizen", Component: CitizenDashboard },
      { path: "officer", Component: OfficerDashboard },
      { path: "shop", Component: ShopDashboard },
      { path: "shop/verify", Component: ShopVerification },
      { path: "application/new", Component: ApplicationForm },
      { path: "applications", Component: ApplicationsList },
      { path: "applications/:id", Component: ApplicationDetails },
      { path: "weapon/register", Component: WeaponRegistration },
      { path: "weapons", Component: WeaponRegistry },
      { path: "decision/:id", Component: DecisionPage },
      { path: "*", Component: NotFound },
    ],
  },
]);
