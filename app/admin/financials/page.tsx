import { getFinancials } from "@/app/actions/financial-actions";
import { FinancialsOverview } from "./_components/FinancialsOverview";

export const dynamic = "force-dynamic";

export default async function FinancialsPage() {
    const data = await getFinancials();
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <FinancialsOverview data={data as any} />
        </div>
    );
}
