import { getDashboardStats } from "@/app/actions/dashboard-actions";
import { DashboardOverview } from "./_components/DashboardOverview";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const data = await getDashboardStats();

    return <DashboardOverview data={data} />;
}
