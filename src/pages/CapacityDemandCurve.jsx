import Card from '../components/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const demandCurve = [
  { reserve: 0, price: 5000 },
  { reserve: 1000, price: 2000 },
  { reserve: 2000, price: 500 },
  { reserve: 3000, price: 100 },
  { reserve: 4000, price: 50 },
  { reserve: 5000, price: 25 },
];

function CapacityDemandCurve() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Capacity Demand Curve</h1>
        <p className="text-slate-500">Operating Reserve Demand Curve (ORDC) pricing</p>
      </div>

      <Card title="ORDC Price Curve">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={demandCurve}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="reserve" tickFormatter={(v) => `${v} MW`} label={{ value: 'Reserve Level', position: 'bottom' }} />
              <YAxis tickFormatter={(v) => `$${v}`} label={{ value: 'Price ($/MWh)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v, name) => [name === 'price' ? `$${v}/MWh` : `${v} MW`, name === 'price' ? 'Price' : 'Reserve']} />
              <Line type="monotone" dataKey="price" stroke="#e53e3e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="ORDC Overview">
        <div className="prose max-w-none">
          <p className="text-slate-600">
            The Operating Reserve Demand Curve (ORDC) is a pricing mechanism that adds an adder to energy prices 
            based on the level of operating reserves. When reserves are low, the adder increases, incentivizing 
            generation and load reduction.
          </p>
          <ul className="mt-4 space-y-2 text-slate-600">
            <li>• <strong>High Reserves:</strong> Low or zero adder</li>
            <li>• <strong>Moderate Reserves:</strong> Moderate adder reflecting scarcity</li>
            <li>• <strong>Low Reserves:</strong> High adder approaching VOLL ($5,000/MWh)</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default CapacityDemandCurve;
