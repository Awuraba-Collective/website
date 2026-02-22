import { getExpenses } from "@/app/actions/expense-actions";
import { ExpensesTable } from "./_components/ExpensesTable";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
    const expenses = await getExpenses();
    return (

        <ExpensesTable expenses={expenses as any} />

    );
}
