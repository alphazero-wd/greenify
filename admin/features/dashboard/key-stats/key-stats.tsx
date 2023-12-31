import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanknotesIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui";
import { formatPrice } from "../../utils";
import { KeyStats as IKeyStats } from "../types";
import { getGrowthRate } from "../utils";

export const KeyStats = ({
  keyStats: {
    curMonthAvgOrder,
    curMonthProductSales,
    curMonthRevenue,
    prevMonthAvgOrder,
    prevMonthProductSales,
    prevMonthRevenue,
  },
}: {
  keyStats: IKeyStats;
}) => {
  const revenueGrowthRate = useMemo(
    () => getGrowthRate(curMonthRevenue, prevMonthRevenue),
    [prevMonthRevenue, curMonthRevenue],
  );
  const salesGrowthRate = useMemo(
    () => getGrowthRate(curMonthProductSales, prevMonthProductSales),
    [curMonthProductSales, prevMonthProductSales],
  );
  const avgOrderGrowthRate = useMemo(
    () => getGrowthRate(curMonthAvgOrder, prevMonthAvgOrder),
    [curMonthAvgOrder, prevMonthAvgOrder],
  );

  const stats = useMemo(
    () => [
      {
        term: "Total Revenue",
        curMonth: formatPrice(curMonthRevenue),
        prevMonth: formatPrice(prevMonthRevenue),
        rate: revenueGrowthRate,
        icon: CurrencyDollarIcon,
      },
      {
        term: "Total Sales",
        curMonth: curMonthProductSales,
        prevMonth: prevMonthProductSales,
        rate: salesGrowthRate,
        icon: CreditCardIcon,
      },
      {
        term: "Avg. Order Price",
        curMonth: formatPrice(curMonthAvgOrder),
        prevMonth: formatPrice(prevMonthAvgOrder),
        rate: avgOrderGrowthRate,
        icon: BanknotesIcon,
      },
    ],
    [
      curMonthAvgOrder,
      curMonthAvgOrder,
      curMonthAvgOrder,
      prevMonthAvgOrder,
      prevMonthAvgOrder,
      prevMonthAvgOrder,
    ],
  );

  return (
    <div>
      <h3 className="text-base font-semibold leading-6 text-gray-900">
        This month
      </h3>
      <dl className="mt-5 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.term}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                {stat.term}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent className="mt-1">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-gray-900">
                  {stat.curMonth}
                </span>
                <div className="ml-2">
                  {isFinite(stat.rate) && (
                    <>
                      {+stat.rate > 0 && (
                        <div className="inline-flex items-baseline rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800 md:mt-2 lg:mt-0">
                          <ArrowUpIcon className="-ml-1 mr-0.5 h-4 w-4 flex-shrink-0 self-center text-green-500" />
                          <span className="sr-only">Increased by</span>
                          {Math.abs(stat.rate).toFixed(2)}%
                        </div>
                      )}

                      {+stat.rate < 0 && (
                        <div className="inline-flex items-baseline rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-medium text-red-800 md:mt-2 lg:mt-0">
                          <ArrowDownIcon className="-ml-1 mr-0.5 h-4 w-4 flex-shrink-0 self-center text-red-500" />
                          <span className="sr-only">Decreased by</span>
                          {Math.abs(stat.rate).toFixed(2)}%
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="mt-1 text-sm font-medium text-gray-500">
                from {stat.prevMonth}
              </div>
            </CardContent>
          </Card>
        ))}
      </dl>
    </div>
  );
};
