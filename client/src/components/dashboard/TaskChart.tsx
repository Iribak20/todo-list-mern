import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTasks } from "@/hooks/useTasks";
import { t } from "@/lib/i18n";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const TaskChart = () => {
  const { getTaskCountByStatus } = useTasks();
  
  const todoCount = getTaskCountByStatus("todo");
  const inProgressCount = getTaskCountByStatus("inprogress");
  const completedCount = getTaskCountByStatus("done");
  
  const data = [
    { name: t("toDo"), value: todoCount, color: "hsl(var(--primary))" },
    { name: t("inProgress"), value: inProgressCount, color: "hsl(var(--secondary))" },
    { name: t("completed"), value: completedCount, color: "hsl(var(--success))" },
  ];

  const containerRef = useRef<HTMLDivElement>(null);

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="bg-neutral-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{t("taskDistribution")}</CardTitle>
        <CardDescription>{t("taskDistributionDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                innerRadius={40}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [value, name]}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskChart;
