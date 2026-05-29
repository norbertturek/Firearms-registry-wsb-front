import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { RedirectTo } from "./components/RedirectTo";
import { ApplicationsLayout } from "./layouts/ApplicationsLayout";
import { LoginPage } from "./pages/LoginPage";
import { CitizenDashboard } from "./pages/CitizenDashboard";
import { OfficerDashboard } from "./pages/OfficerDashboard";
import { ShopDashboard } from "./pages/ShopDashboard";
import { ApplicationTypeSelect } from "./pages/ApplicationTypeSelect";
import { ApplicationsList } from "./pages/ApplicationsList";
import { ApplicationDetails } from "./pages/ApplicationDetails";
import { WeaponRegistry } from "./pages/WeaponRegistry";
import { DecisionPage } from "./pages/DecisionPage";
import { ShopSalePage } from "./pages/ShopSalePage";
import { NotFound } from "./pages/NotFound";
import { PermitApplicationForm } from "./pages/PermitApplicationForm";
import { PromiseApplicationForm } from "./pages/PromiseApplicationForm";
import { PromisesView } from "./pages/PromisesView";
import { TransfersList } from "./pages/TransfersList";
import { MedicalAlertsView } from "./pages/MedicalAlertsView";
import { WPASearchPage } from "./pages/WPASearchPage";
import { CitizenDetailsWPA } from "./pages/CitizenDetailsWPA";
import { PermitDetails } from "./pages/PermitDetails";
import { WpaAttachmentViewPage } from "./pages/WpaAttachmentViewPage";
import { ApplicationCorrection } from "./pages/ApplicationCorrection";
import { LegacyOfficerAttachmentRedirect, LegacyOfficerCitizenRedirect } from "./components/officer/LegacyOfficerRedirects";

export const router = createBrowserRouter([
  {
    path: "/officer/attachments/:applicationId/:attachmentId",
    Component: WpaAttachmentViewPage,
  },
  {
    path: "/wpa/attachments/:applicationId/:attachmentId",
    Component: LegacyOfficerAttachmentRedirect,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LoginPage },
      { path: "citizen", Component: CitizenDashboard },
      { path: "officer", Component: OfficerDashboard },
      { path: "shop", Component: ShopDashboard },
      { path: "shop/verify", Component: () => <RedirectTo to="/shop/sale" /> },
      { path: "shop/sale", Component: ShopSalePage },

      // Legacy URLs
      { path: "application/new-permit", Component: () => <RedirectTo to="/applications/new/permit" /> },
      { path: "application/new-promise", Component: () => <RedirectTo to="/applications/new/promise" /> },
      { path: "application/new/permit", Component: () => <RedirectTo to="/applications/new/permit" /> },
      { path: "application/new/promise", Component: () => <RedirectTo to="/applications/new/promise" /> },
      { path: "applications/new", Component: () => <RedirectTo to="/application/new" /> },

      { path: "application/new", Component: ApplicationTypeSelect },

      {
        path: "applications",
        Component: ApplicationsLayout,
        children: [
          { index: true, Component: ApplicationsList },
          { path: "new/permit", Component: PermitApplicationForm },
          { path: "new/promise", Component: PromiseApplicationForm },
          { path: ":id/correction", Component: ApplicationCorrection },
          { path: ":id", Component: ApplicationDetails },
        ],
      },
      { path: "promises", Component: PromisesView },
      { path: "permits/:id", Component: PermitDetails },
      { path: "transfers", Component: TransfersList },
      { path: "medical-alerts", Component: MedicalAlertsView },
      { path: "weapons", Component: WeaponRegistry },
      { path: "decision/:id", Component: DecisionPage },

      // Officer registry routes
      { path: "officer/search", Component: WPASearchPage },
      { path: "officer/citizens/:id", Component: CitizenDetailsWPA },

      // Legacy WPA frontend URLs
      { path: "wpa/search", Component: () => <RedirectTo to="/officer/search" /> },
      { path: "wpa/citizens/:id", Component: LegacyOfficerCitizenRedirect },

      { path: "*", Component: NotFound },
    ],
  },
]);
