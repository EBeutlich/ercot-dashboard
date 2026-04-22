import Card from '../components/Card';

const weatherZones = [
  { name: 'Coast', temp: 78, humidity: 65, conditions: 'Partly Cloudy' },
  { name: 'East', temp: 82, humidity: 58, conditions: 'Sunny' },
  { name: 'Far West', temp: 88, humidity: 25, conditions: 'Clear' },
  { name: 'North', temp: 75, humidity: 45, conditions: 'Partly Cloudy' },
  { name: 'North Central', temp: 80, humidity: 50, conditions: 'Sunny' },
  { name: 'South', temp: 85, humidity: 70, conditions: 'Humid' },
  { name: 'South Central', temp: 83, humidity: 55, conditions: 'Sunny' },
  { name: 'West', temp: 90, humidity: 20, conditions: 'Hot & Dry' },
];

function WeatherZones() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Weather Zones</h1>
        <p className="text-slate-500">Current weather conditions across ERCOT weather zones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {weatherZones.map((zone) => (
          <Card key={zone.name}>
            <div className="text-center">
              <h3 className="font-semibold text-lg text-slate-800">{zone.name}</h3>
              <p className="text-4xl font-bold text-ercot-accent mt-2">{zone.temp}°F</p>
              <p className="text-sm text-slate-500 mt-1">{zone.conditions}</p>
              <div className="mt-3 flex justify-center items-center gap-2 text-sm text-slate-600">
                <span>💧 {zone.humidity}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Weather Impact on Load">
        <p className="text-slate-600">
          Weather conditions significantly affect electricity demand in Texas. High temperatures 
          increase cooling load, while mild weather reduces overall system demand. ERCOT uses 
          weather zone data to forecast load and ensure reliable grid operations.
        </p>
      </Card>
    </div>
  );
}

export default WeatherZones;
