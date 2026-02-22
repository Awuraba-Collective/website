import { getCustomers } from "@/app/actions/customer-actions";
import { CustomersTable } from "./_components/CustomersTable";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
    const customers = await getCustomers();

    return (

        <CustomersTable customers={customers} />

    );
}
