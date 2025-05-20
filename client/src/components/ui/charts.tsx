import { BarChartIcon, LineChartIcon, PieChartIcon } from "lucide-react";

// Simple chart components that simulate charts with styled div blocks
// In a production app, you would use a charting library like Recharts, Chart.js, or Tremor

export function BarChart({
  data,
  index,
  categories,
  colors = ["#2563eb", "#93c5fd"],
  layout = "horizontal",
  stack = false,
  valueFormatter = (value) => `${value}`,
  className = "h-64",
}) {
  // Simple bar chart visualization
  if (!data || !data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <BarChartIcon className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground mt-2">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.flatMap(item => 
    categories.map(category => 
      typeof item[category] === 'number' ? item[category] : 0
    )
  ));

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-4">
          {categories.map((category, i) => (
            <div key={category} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="text-sm">{category}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2 h-[calc(100%-2rem)] overflow-y-auto">
        {data.map((item, i) => (
          <div key={`${index}-${i}`} className="space-y-1">
            <div className="text-sm text-muted-foreground">{item[index]}</div>
            <div className="flex gap-1 h-8">
              {categories.map((category, categoryIndex) => {
                const value = item[category] || 0;
                const percentage = (value / maxValue) * 100;
                
                return (
                  <div
                    key={category}
                    className="h-full rounded flex items-center justify-end px-2 text-xs text-white font-medium overflow-hidden transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: colors[categoryIndex % colors.length],
                    }}
                  >
                    {percentage > 15 ? valueFormatter(value) : ''}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineChart({
  data,
  index,
  categories,
  colors = ["#2563eb"],
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  className = "h-64",
}) {
  if (!data || !data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <LineChartIcon className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground mt-2">No data available</p>
      </div>
    );
  }

  const minValue = Math.min(
    0,
    ...data.flatMap((item) =>
      categories.map((category) =>
        typeof item[category] === "number" ? item[category] : 0
      )
    )
  );
  
  const maxValue = Math.max(
    ...data.flatMap((item) =>
      categories.map((category) =>
        typeof item[category] === "number" ? item[category] : 0
      )
    )
  );

  // Generate points for the line
  const chartHeight = 180;
  const chartWidth = 100 * data.length;
  
  const getY = (value) => {
    const range = maxValue - minValue;
    return chartHeight - ((value - minValue) / range) * chartHeight;
  };

  return (
    <div className={`w-full ${className}`}>
      {showLegend && (
        <div className="flex flex-wrap gap-4 mb-4">
          {categories.map((category, i) => (
            <div key={category} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="text-sm">{category}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="relative h-[calc(100%-2rem)] border-b border-l border-border">
        <div className="absolute inset-0 flex flex-col justify-between text-xs text-muted-foreground py-1">
          <div>{valueFormatter(maxValue)}</div>
          <div>{valueFormatter((maxValue + minValue) / 2)}</div>
          <div>{valueFormatter(minValue)}</div>
        </div>
        
        <div className="absolute left-6 right-2 top-0 bottom-0">
          <div className="relative h-full w-full overflow-x-auto">
            <div 
              className="absolute inset-0"
              style={{ width: `${Math.max(100, data.length * 40)}px` }}
            >
              {categories.map((category, categoryIndex) => {
                const points = data.map((item, i) => ({
                  x: (i / (data.length - 1)) * 100,
                  y: getY(item[category] || 0),
                  value: item[category] || 0,
                  label: item[index],
                }));

                return (
                  <div key={category} className="absolute inset-0">
                    {/* Line */}
                    <svg className="absolute inset-0 h-full w-full">
                      <path
                        d={`M ${points.map(p => `${p.x}% ${p.y}px`).join(' L ')}`}
                        fill="none"
                        stroke={colors[categoryIndex % colors.length]}
                        strokeWidth="2"
                      />
                    </svg>
                    
                    {/* Points */}
                    {points.map((point, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-background border-2 transition-all duration-300 hover:w-3 hover:h-3 hover:-translate-x-[2px] hover:-translate-y-[2px]"
                        style={{
                          left: `${point.x}%`,
                          top: `${point.y}px`,
                          borderColor: colors[categoryIndex % colors.length],
                          display: categoryIndex === 0 ? 'block' : 'none', // Only show points for first category
                        }}
                        title={`${point.label}: ${valueFormatter(point.value)}`}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* X-axis labels */}
        <div 
          className="absolute left-6 right-2 bottom-0 translate-y-full text-xs flex justify-between text-muted-foreground mt-1 overflow-hidden"
          style={{ width: `${Math.max(100, data.length * 40)}px` }}
        >
          {data.map((item, i) => (
            <div key={i} style={{ position: 'absolute', left: `${(i / (data.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}>
              {item[index]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PieChart({
  data,
  index,
  categories,
  colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"],
  valueFormatter = (value) => `${value}`,
  className = "h-64",
}) {
  if (!data || !data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <PieChartIcon className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground mt-2">No data available</p>
      </div>
    );
  }

  const category = categories[0]; // Use first category for pie chart
  const total = data.reduce((sum, item) => sum + (item[category] || 0), 0);
  
  // Calculate angles for each slice
  let currentAngle = 0;
  const slices = data.map((item, i) => {
    const value = item[category] || 0;
    const percentage = (value / total) * 100;
    const angle = (percentage / 100) * 360;
    
    const slice = {
      name: item[index],
      value,
      percentage,
      color: colors[i % colors.length],
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    
    currentAngle += angle;
    return slice;
  });

  return (
    <div className={`w-full ${className} flex flex-col items-center`}>
      <div className="relative w-48 h-48 mb-4">
        {/* Render pie chart slices */}
        {slices.map((slice, i) => {
          // Convert angles to radians
          const startAngle = (slice.startAngle - 90) * (Math.PI / 180);
          const endAngle = (slice.endAngle - 90) * (Math.PI / 180);
          
          // Calculate SVG path
          const x1 = 24 + 24 * Math.cos(startAngle);
          const y1 = 24 + 24 * Math.sin(startAngle);
          const x2 = 24 + 24 * Math.cos(endAngle);
          const y2 = 24 + 24 * Math.sin(endAngle);
          
          // Determine if the slice is more than 180 degrees
          const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
          
          // Generate SVG path
          const d = `M 24 24 L ${x1} ${y1} A 24 24 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
          
          return (
            <div key={i} className="absolute inset-0 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 48 48">
                <path
                  d={d}
                  fill={slice.color}
                  stroke="white"
                  strokeWidth="0.5"
                />
              </svg>
            </div>
          );
        })}
        
        {/* Render percentage in the middle */}
        {slices.length === 1 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl font-bold">{Math.round(slices[0].percentage)}%</div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: slice.color }}
            />
            <span className="truncate max-w-[100px]">{slice.name}</span>
            <span className="text-muted-foreground ml-auto">
              {Math.round(slice.percentage)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}