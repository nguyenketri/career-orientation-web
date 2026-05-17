import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

import { hollandMaps } from "../utils/hollandMap";

const HollandChart = ({ scores }) => {
  const data = Object.entries(scores).map(([key, value]) => ({
    subject: hollandMaps[key]?.name || key,
    score: value,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <Radar
            dataKey="score"
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HollandChart;
