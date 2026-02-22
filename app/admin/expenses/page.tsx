import { getExpenses } from "@/app/actions/expense-actions";
import { ExpensesTable } from "./_components/ExpensesTable";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
    const expenses = await getExpenses();
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <ExpensesTable expenses={expenses as any} />
        </div>
    );
}
