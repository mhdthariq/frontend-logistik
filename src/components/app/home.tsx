import { lazy } from "react";
const ReturnTasksPage = lazy(() => import("@/components/app/pages/return-tasks-page").then(m => ({ default: m.ReturnTasksPage })));
const TariffsPage = lazy(() => import("@/components/app/pages/tariffs-page").then(m => ({ default: m.TariffsPage })));
const CustomersPage = lazy(() => import("@/components/app/pages/customers-page").then(m => ({ default: m.CustomersPage })));
const GudangPage = lazy(() => import("@/components/app/pages/gudang-page").then(m => ({ default: m.GudangPage })));
const DeliveriesPage = lazy(() => import("@/components/app/pages/deliveries-page").then(m => ({ default: m.DeliveriesPage })));
const PickupsPage = lazy(() => import("@/components/app/pages/pickups-page").then(m => ({ default: m.PickupsPage })));



import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useAppRoute } from "@/hooks/use-app-route";
import { AuthGate } from "@/components/app/auth-gate";
import { AppShell } from "@/components/app/app-shell";

const DashboardPage = lazy(() => import("@/components/app/pages/dashboard-page").then(m => ({ default: m.DashboardPage })));
const KurirDashboard = lazy(() => import("@/components/app/pages/kurir-dashboard-page").then(m => ({ default: m.KurirDashboard })));
const DriverDashboard = lazy(() => import("@/components/app/pages/driver-dashboard-page").then(m => ({ default: m.DriverDashboard })));
const VehicleOwnerDashboard = lazy(() => import("@/components/app/pages/vo-dashboard-page").then(m => ({ default: m.VehicleOwnerDashboard })));
const ShipmentsPage = lazy(() => import("@/components/app/pages/shipments-page").then(m => ({ default: m.ShipmentsPage })));
const TransportsPage = lazy(() => import("@/components/app/pages/transports-page").then(m => ({ default: m.TransportsPage })));
const TransportDetailPage = lazy(() => import("@/components/app/pages/transport-detail-page").then(m => ({ default: m.TransportDetailPage })));
const TransportManifestPrint = lazy(() => import("@/components/app/transport-manifest-print").then(m => ({ default: m.TransportManifestPrint })));
const VehiclesPage = lazy(() => import("@/components/app/pages/vehicles-page").then(m => ({ default: m.VehiclesPage })));

const RoutesPage = lazy(() => import("@/components/app/pages/routes-page").then(m => ({ default: m.RoutesPage })));
const InvoicesPage = lazy(() => import("@/components/app/pages/invoices-page").then(m => ({ default: m.InvoicesPage })));
const InvoiceDetailPage = lazy(() => import("@/components/app/pages/invoice-detail-page").then(m => ({ default: m.InvoiceDetailPage })));
const AccessPage = lazy(() => import("@/components/app/pages/access-page").then(m => ({ default: m.AccessPage })));
const AuditPage = lazy(() => import("@/components/app/pages/audit-page").then(m => ({ default: m.AuditPage })));
// Revise.md — partner wallet financial system pages
const WalletPage = lazy(() => import("@/components/app/pages/wallet-page").then(m => ({ default: m.WalletPage })));
const B2BCommissionsPage = lazy(() => import("@/components/app/pages/b2b-commissions-page").then(m => ({ default: m.B2BCommissionsPage })));
const MyVehiclesPage = lazy(() => import("@/components/app/pages/my-vehicles-page").then(m => ({ default: m.MyVehiclesPage })));
const VOTransportHistoryPage = lazy(() => import("@/components/app/pages/vo-transport-history-page").then(m => ({ default: m.VOTransportHistoryPage })));
const RepairsPage = lazy(() => import("@/components/app/pages/repairs-page").then(m => ({ default: m.RepairsPage })));
const BankAccountsPage = lazy(() => import("@/components/app/pages/bank-accounts-page").then(m => ({ default: m.BankAccountsPage })));
const OperationalExpensesPage = lazy(() => import("@/components/app/pages/operational-expenses-page").then(m => ({ default: m.OperationalExpensesPage })));
const FinancePage = lazy(() => import("@/components/app/pages/finance-page").then(m => ({ default: m.FinancePage })));
const TopUpManagementPage = lazy(() => import("@/components/app/pages/topups-page").then(m => ({ default: m.TopUpManagementPage })));
const WithdrawalManagementPage = lazy(() => import("@/components/app/pages/withdrawals-page").then(m => ({ default: m.WithdrawalManagementPage })));
const SettlementsPage = lazy(() => import("@/components/app/pages/settlements-page").then(m => ({ default: m.SettlementsPage })));
const PartnersPage = lazy(() => import("@/components/app/pages/partners-page").then(m => ({ default: m.PartnersPage })));
const ProfilePage = lazy(() => import("@/components/app/pages/profile-page").then(m => ({ default: m.ProfilePage })));

function Router() {
  const { segments, query } = useAppRoute();
  return <AuthGate><RouterInner segments={segments} query={query} /></AuthGate>;
}

function RouterInner({ segments, query }: { segments: string[]; query: URLSearchParams }) {
  const { user } = useAuth();
  if (!user) return null;

  const section = segments[0] ?? "dashboard";

  // Revision Part P — role-aware dashboard: kurir and driver/kenek get their
  // dedicated operational dashboards; Vehicle Owner gets the partner financial
  // dashboard (Revise.md §17); everyone else keeps the full dashboard.
  const roleSlugs = user.roles.map((r) => r.slug);
  const isKurir = roleSlugs.includes("kurir");
  const isDriverCrew = roleSlugs.includes("driver") || roleSlugs.includes("kenek");
  const isVehicleOwner = user.partnerType === "VEHICLE_OWNER";

  const page = (() => {
    switch (section) {
      case "pickups": return <PickupsPage />;
      case "shipments":
        return <ShipmentsPage shipmentId={segments[1] ? Number(segments[1]) : null} autoPrint={query.get("print") === "1"} />;
      case "deliveries": return <DeliveriesPage />;
      case "transports":
        // #/transports/{id}/manifest — dedicated print preview, like invoices.
        if (segments[1] && segments[2] === "manifest") {
          return <TransportManifestPrint key={segments[1]} transportId={Number(segments[1])} onClose={() => (window.location.hash = `#/transports/${segments[1]}`)} />;
        }
        return segments[1] ? <TransportDetailPage transportId={Number(segments[1])} initialTab={query.get("tab") ?? undefined} /> : <TransportsPage />;
      case "transport-history":
        // Revision Part V — driver/kenek transport history view
        return <TransportsPage historyMode />;
      case "vo-transport-history":
        // Revise.md §16 — Vehicle Owner transport history
        return <VOTransportHistoryPage />;
      case "earnings":
        // Revise.md §32 — Vehicle Owner earnings view (same page, earnings tab)
        return <VOTransportHistoryPage initialTab="earnings" />;
      case "vehicles":
        return <VehiclesPage />;
      case "fleet-capacity":
        // Merged into the Vehicles page "Kapasitas Armada" tab — redirect.
        return <VehiclesPage />;
      case "my-vehicles":
        // Revise.md §13/§32 — Vehicle Owner's own vehicles
        return <MyVehiclesPage />;
      case "gudang":
      case "gudang-ops": return <GudangPage />;
      case "customers": return <CustomersPage />;
      case "tariffs": return <TariffsPage />;
      case "return-tasks": return <ReturnTasksPage />;
      case "routes":
        return <RoutesPage routeId={segments[1] ? Number(segments[1]) : null} />;
      case "invoices":
        return segments[1] ? <InvoiceDetailPage invoiceId={Number(segments[1])} /> : <InvoicesPage />;
      case "access":
        return <AccessPage />;
      case "audit":
        return <AuditPage />;
      // ----- Revise.md — partner wallet financial system -------------------
      case "wallet":
        return <WalletPage />;
      case "b2b":
        return <B2BCommissionsPage />;
      case "repairs":
        return <RepairsPage />;
      case "bank-accounts":
        return <BankAccountsPage />;
      case "operational-expenses":
        return <OperationalExpensesPage />;
      case "finance":
        return <FinancePage />;
      case "topups":
        return <TopUpManagementPage />;
      case "withdrawals":
        return <WithdrawalManagementPage />;
      case "settlements":
        return <SettlementsPage />;
      case "partners":
        return <PartnersPage />;
      case "profile":
        return <ProfilePage />;
      default:
        if (isKurir) return <KurirDashboard />;
        if (isDriverCrew) return <DriverDashboard />;
        if (isVehicleOwner) return <VehicleOwnerDashboard />;
        return <DashboardPage />;
    }
  })();

  return (
    <AppShell path={`/${segments.join("/")}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {page}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}

export default function Home() {
  return <Router />;
}
