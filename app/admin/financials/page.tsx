import { getFinancials } from "@/app/actions/financial-actions";
import { FinancialsOverview } from "./_components/FinancialsOverview";

export const dynamic = "force-dynamic";

export default async function FinancialsPage() {
    const data = await getFinancials();
    return (

        <FinancialsOverview data={data as any} />

    );
}
