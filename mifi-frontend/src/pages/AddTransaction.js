import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define the validation schema
const transactionSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .regex(/^\d*\.?\d*$/, "Please enter a valid number")
    .transform((val) => parseFloat(val)),
  type: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});

export const AddTransaction = () => {
    const form = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            amount: "",
            type: "",
            category: "",
            accountId: "",
            date: new Date().toISOString().split('T')[0],
            description: "",
        },
    });
    
    const onSubmit = (data) => {
        console.log(data);
    };

    const inputClassName = "w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
    const labelClassName = "block text-sm font-medium text-gray-700";
    const errorClassName = "text-xs text-red-600";
    const selectClassName = "w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white";

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">Add Transaction</h1>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
                <div>
                    <label className={labelClassName}>
                        Amount
                    </label>
                    <input
                        {...form.register("amount")}
                        type="number"
                        step="0.01"
                        placeholder="Enter amount"
                        className={inputClassName}
                    />
                    {form.formState.errors.amount && (
                        <p className={errorClassName}>
                            {form.formState.errors.amount.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClassName}>
                        Type
                    </label>
                    <select
                        {...form.register("type")}
                        className={selectClassName}
                    >
                        <option value="">Select type</option>
                        <option value="INCOME">Income</option>
                        <option value="EXPENSE">Expense</option>
                    </select>
                    {form.formState.errors.type && (
                        <p className={errorClassName}>
                            {form.formState.errors.type.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClassName}>
                        Category
                    </label>
                    <input
                        {...form.register("category")}
                        type="text"
                        placeholder="Enter category"
                        className={inputClassName}
                    />
                    {form.formState.errors.category && (
                        <p className={errorClassName}>
                            {form.formState.errors.category.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClassName}>
                        Account
                    </label>
                    <input
                        {...form.register("accountId")}
                        type="text"
                        placeholder="Select account"
                        className={inputClassName}
                    />
                    {form.formState.errors.accountId && (
                        <p className={errorClassName}>
                            {form.formState.errors.accountId.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClassName}>
                        Date
                    </label>
                    <input
                        {...form.register("date")}
                        type="date"
                        className={inputClassName}
                    />
                    {form.formState.errors.date && (
                        <p className={errorClassName}>
                            {form.formState.errors.date.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelClassName}>
                        Description
                    </label>
                    <input
                        {...form.register("description")}
                        type="text"
                        placeholder="Enter description (optional)"
                        className={inputClassName}
                    />
                    {form.formState.errors.description && (
                        <p className={errorClassName}>
                            {form.formState.errors.description.message}
                        </p>
                    )}
                </div>

                <button 
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-1.5 px-4 rounded-md hover:bg-indigo-700 transition-colors mt-2"
                >
                    Add Transaction
                </button>
            </form>
        </div>
    );
};

