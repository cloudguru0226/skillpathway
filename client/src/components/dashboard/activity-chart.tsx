import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function ActivityChart() {
  const { data: activity = [], isLoading } = useQuery({
    queryKey: ["/api/activity?days=7"],
  });

  // Process activity data by day of the week
  const processActivityData = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDay(); // 0 is Sunday
    
    // Initialize daily totals array (in minutes)
    const dailyTotals = Array(7).fill(0);
    
    // Fill with actual data
    activity.forEach((a: any) => {
      const date = new Date(a.date);
      const dayIndex = date.getDay(); // 0-6
      dailyTotals[dayIndex] += a.duration; // Add minutes
    });
    
    // Reorder days to make today the last day
    const reorderedDays = [...days.slice(today + 1), ...days.slice(0, today + 1)];
    const reorderedTotals = [...dailyTotals.slice(today + 1), ...dailyTotals.slice(0, today + 1)];
    
    // Convert minutes to hours for display
    const hoursPerDay = reorderedTotals.map(minutes => minutes / 60);
    
    // Get the maximum value for scaling
    const maxHours = Math.max(...hoursPerDay) || 1;
    
    // Calculate heights as percentages (20% to 100%)
    const heights = hoursPerDay.map(hours => Math.max(20, Math.round((hours / maxHours) * 100)));
    
    // Create tooltips
    const tooltips = hoursPerDay.map((hours, i) => 
      `${reorderedDays[i]}: ${hours.toFixed(1)}h`
    );
    
    return {
      days: reorderedDays,
      heights,
      tooltips
    };
  };

  const { days, heights, tooltips } = processActivityData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md">Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <>
            <div className="flex justify-between h-20 items-end mb-2">
              {heights.map((height, index) => (
                <div
                  key={index}
                  className="w-8 bg-primary-foreground hover:bg-primary transition-colors rounded-t"
                  style={{ height: `${height}%` }}
                  title={tooltips[index]}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              {days.map((day, index) => (
                <span key={index}>{day}</span>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
