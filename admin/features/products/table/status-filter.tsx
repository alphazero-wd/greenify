"use client";
import {
  Badge,
  Button,
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from "@/features/ui";
import { cn } from "@/lib/utils";
import { DotFilledIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { useEffect, useState } from "react";
import { StatusGroup } from "../types";

interface StatusFilterProps {
  statusGroups: StatusGroup[];
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ statusGroups }) => {
  const [status, setStatus] = useState<"Active" | "Draft" | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const currentStatus = searchParams.get("status") as "Active" | "Draft";
    if (!currentStatus) return;
    setStatus(currentStatus);
  }, [searchParams.get("status")]);

  useEffect(() => {
    const currentQuery = qs.parse(searchParams.toString());
    if (status) currentQuery.status = status;
    else delete currentQuery.status;
    const urlWithStatusQuery = qs.stringifyUrl({
      url: pathname,
      query: currentQuery,
    });
    router.push(urlWithStatusQuery);
  }, [status, router, searchParams.toString()]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          Status
          {status && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {status}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {(["Active", "Draft"] as const).map((s) => (
                <CommandItem key={s} onSelect={() => setStatus(s)}>
                  <div
                    className={cn(
                      "mr-2 h-4 w-4",
                      status === s
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible",
                    )}
                  >
                    <DotFilledIcon className="h-4 w-4" />
                  </div>
                  <span>{s}</span>
                  {statusGroups.find((group) => group.status === s)?._count && (
                    <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                      {
                        statusGroups.find((group) => group.status === s)?._count
                          .id
                      }
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {status && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setStatus(null)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};