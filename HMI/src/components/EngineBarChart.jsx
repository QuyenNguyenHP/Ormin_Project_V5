import PropTypes from "prop-types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const defaultData = [
  { name: "Cyl 1", value: 400 },
  { name: "Cyl 2", value: 300 },
  { name: "Cyl 3", value: 300 },
  { name: "Cyl 4", value: 200 },
  { name: "Cyl 5", value: 278 },
  { name: "Cyl 6", value: 189 },
];

const colors = ["#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#38bdf8"];

const getTrianglePath = (x, y, width, height) => {
  return `M${x},${y + height}
          C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3}
          ${x + width / 2}, ${y}
          C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height}
          ${x + width}, ${y + height}
          Z`;
};

const TriangleBar = ({ fill, x, y, width, height }) => {
  return <path d={getTrianglePath(x, y, width, height)} stroke="none" fill={fill} />;
};

TriangleBar.propTypes = {
  fill: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
};

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "8px",
  color: "#f8fafc",
};

const labelStyle = {
  color: "#cbd5e1",
};

const EngineBarChart = ({ data = defaultData, title = "Cylinder Load Distribution" }) => {
  return (
    <div className="w-full rounded-[12px] bg-[#111827] border border-[#334155] p-5">
      <div className="mb-4">
        <h3 className="m-0 text-[18px] font-semibold text-[#f8fafc]">{title}</h3>
        <p className="mt-2 mb-0 text-[13px] text-[#94a3b8]">
          Custom triangle bars based on the Recharts example, adapted for the engine view.
        </p>
      </div>
      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
              contentStyle={tooltipStyle}
              labelStyle={labelStyle}
            />
            <Bar
              dataKey="value"
              shape={<TriangleBar />}
              label={{ position: "top", fill: "#f8fafc" }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

EngineBarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ),
  title: PropTypes.string,
};

export default EngineBarChart;
