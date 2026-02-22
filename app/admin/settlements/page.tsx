import { getFinancials } from "@/app/actions/financial-actions";
import { SettlementsTable } from "./_components/SettlementsTable";

export const dynamic = "force-dynamic";

export default async function SettlementsPage() {
    const data = await getFinancials();
    return (

        <SettlementsTable
            settlements={data.settlements as any}
            totalCostPrice={data.totalCostPrice}
            totalSettled={data.totalSettled}
        />

    );
}
