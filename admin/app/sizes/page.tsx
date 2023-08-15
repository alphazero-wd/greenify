import { getSizes } from "@/features/sizes/actions";
import {
  CreateSizeButton,
  CreateSizeModal,
} from "@/features/sizes/create-size";
import { SizesTable } from "@/features/sizes/table";
import { Breadcrumb, DeleteRecordsModal } from "@/features/ui";
import { getCurrentUser } from "@/features/user/utils";
import { redirect } from "next/navigation";
import qs from "query-string";
import { EditSizeModal } from "../../features/sizes/edit-size";

export const metadata = {
  title: "Sizes",
};

interface CategoriesPageProps {
  searchParams: {
    limit?: string;
    offset?: string;
    sortBy?: string;
    order?: "asc" | "desc";
    q?: string;
  };
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const url = qs.stringifyUrl({
    url: process.env.NEXT_PUBLIC_API_URL! + "/sizes",
    query: searchParams,
  });
  const { count, data } = await getSizes(url);

  return (
    <>
      <div className="max-w-5xl">
        <div className="mb-4">
          <Breadcrumb links={[{ name: "Sizes", href: `/sizes` }]} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Sizes ({count})
        </h1>

        <div className="mt-3">
          <CreateSizeButton />
        </div>

        <div className="mt-6 space-y-8">
          <SizesTable sizes={data} count={count} />
        </div>
      </div>
      <CreateSizeModal />
      <EditSizeModal />
      <DeleteRecordsModal entityName="sizes" />
    </>
  );
}
