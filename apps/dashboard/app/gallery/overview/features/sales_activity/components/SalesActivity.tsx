"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from "recharts";

function CustomTooltip({
  payload,
  label,
  active,
}: {
  payload: any;
  label: any;
  active: any;
}) {
  if (active) {
    return (
      <div className="custom-tooltip bg-dark text-white p-5 rounded-md border border-white">
        {/* <p className="label">{`${label}`}</p> */}
        <p className="label">
          {`Total revenue for month of ${label}:`}{" "}
          <strong>{payload[0].payload.value}</strong>
        </p>
      </div>
    );
  }

  return null;
}
export function SalesActivity({ activityData }: any) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        paddingBottom: "400px",
      }}
    >
      <div
        className="text-[14px] text-gray-700"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <ResponsiveContainer>
          <ComposedChart data={activityData} margin={{ top: 3, bottom: 35 }}>
            <CartesianGrid stroke="#f5f5f5" />

            <XAxis
              dataKey="name"
              className="text-[14px]"
              padding={{ left: 50, right: 10 }}
              scale="point"
            />
            <YAxis className="text-[14px] " />
            <Tooltip
              content={
                <CustomTooltip
                  payload={activityData[0].revenue}
                  label={`${activityData[0].name}`}
                  active={true}
                />
              }
            />
            <Legend verticalAlign="bottom" />

            <Bar dataKey="revenue" barSize={100} fill="#1a1a1a" />
            {/* <Line type="monotone" dataKey={"Revenue"} stroke="#1a1a1a" /> */}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// const data = [
//   {
//     name: "Page A",
//     uv: 590,
//     pv: 800,
//     amt: 1400,
//   },
//   {
//     name: "Page B",
//     uv: 868,
//     pv: 967,
//     amt: 1506,
//   },
//   {
//     name: "Page C",
//     uv: 1397,
//     pv: 1098,
//     amt: 989,
//   },
//   {
//     name: "Page D",
//     uv: 1480,
//     pv: 1200,
//     amt: 1228,
//   },
//   {
//     name: "Page E",
//     uv: 1520,
//     pv: 1108,
//     amt: 1100,
//   },
//   {
//     name: "Page F",
//     uv: 1400,
//     pv: 680,
//     amt: 1700,
//   },
// ];
//         <ResponsiveContainer width="100%" height="100%">
//           <ComposedChart
//             width={500}
//             height={400}
//             data={data}
//             margin={{
//               top: 20,
//               right: 20,
//               bottom: 20,
//               left: 20,
//             }}
//           >
//             <CartesianGrid stroke="#f5f5f5" />
//             <XAxis dataKey="name" scale="band" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="uv" barSize={20} fill="#413ea0" />
//             <Line type="monotone" dataKey="uv" stroke="#ff7300" />
//           </ComposedChart>
//         </ResponsiveContainer>;
