"use client";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { useMemo } from "react";
import { Button } from "../button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { DeleteRecordsModal } from "./delete-records-modal";
import { useDeleteRecordsModal } from "./use-delete-records-modal";

interface DataTablePaginationProps<TData extends { id: number; name: string }> {
  table: Table<TData>;
  entityName: "categories" | "sizes" | "colors" | "products" | "billboards";
}

export function DataTablePagination<
  TData extends { id: number; name: string },
>({ table, entityName }: DataTablePaginationProps<TData>) {
  const selectedRows = useMemo(
    () =>
      table.getSelectedRowModel().rows.map(({ original }) => ({
        id: original.id,
        name: original.name,
      })),
    [table.getFilteredSelectedRowModel().rows],
  );
  const { onOpen } = useDeleteRecordsModal();

  return (
    <>
      <div className="flex flex-col items-center gap-y-3 px-2 md:flex-row md:justify-between md:gap-y-0">
        <div className="flex items-center justify-start gap-x-3">
          <div className="text-sm text-gray-500">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        </div>
        <div className="flex items-center justify-end gap-x-6 lg:gap-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value: string) => {
                table.setPageSize(+value);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <Button onClick={onOpen} variant="destructive" className="mt-3">
          Delete selected rows
        </Button>
      )}
      <DeleteRecordsModal entityName={entityName} records={selectedRows} />
    </>
  );
}
