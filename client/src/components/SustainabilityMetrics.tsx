import { Leaf, Droplets, Zap, Trash2 } from "lucide-react";

export interface SustainabilityMetricsProps {
  garmentsGivenSecondLife: number;
  landfillWasteDivertedLbs: string;
  waterSavedGallons: string;
  carbonEmissionsAvoided: string;
  equivalentTreesPlanted: string;
}

export default function SustainabilityMetrics({
  garmentsGivenSecondLife,
  landfillWasteDivertedLbs,
  waterSavedGallons,
  carbonEmissionsAvoided,
  equivalentTreesPlanted,
}: SustainabilityMetricsProps) {
  const metrics = [
    {
      icon: Trash2,
      label: "Pounds of waste diverted from landfills",
      value: landfillWasteDivertedLbs,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      icon: Droplets,
      label: "Gallons of water saved",
      value: waterSavedGallons,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Zap,
      label: "kg CO₂ emissions avoided",
      value: carbonEmissionsAvoided,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Leaf,
      label: "Equivalent trees planted",
      value: equivalentTreesPlanted,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-foreground">
          Your Environmental Impact
        </h3>
        <p className="text-muted-foreground">
          By purchasing {garmentsGivenSecondLife} secondhand{" "}
          {garmentsGivenSecondLife === 1 ? "garment" : "garments"} from Urban Refit, you've helped:
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className={`${metric.bgColor} rounded-lg p-6 space-y-3 border border-border`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm text-muted-foreground font-medium">
                    {metric.label}
                  </p>
                  <p className={`text-3xl font-bold ${metric.color}`}>
                    {metric.value}
                  </p>
                </div>
                <Icon className={`${metric.color} w-8 h-8 flex-shrink-0`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-accent/5 rounded-lg p-6 border border-border space-y-3">
        <p className="text-sm font-semibold text-foreground">Did you know?</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The fashion industry produces 10% of global carbon emissions and is the
          second-largest consumer of water. By choosing secondhand, you're actively
          reducing your environmental footprint and supporting a circular economy.
        </p>
      </div>
    </div>
  );
}
