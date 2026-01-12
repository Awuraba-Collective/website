import { getCustomers } from "@/app/actions/customer-actions";
import { CustomersTable } from "./_components/CustomersTable";

export default async function CustomersPage() {
    const customers = await getCustomers();

    return (
        <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
            <CustomersTable customers={customers} />
        </div>
    );
}
