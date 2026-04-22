import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Dashboard Pages
import Home from './pages/Home';
import SystemDemand from './pages/SystemDemand';
import RealTimePrices from './pages/RealTimePrices';
import DayAheadPrices from './pages/DayAheadPrices';
import GenerationByFuel from './pages/GenerationByFuel';
import WindGeneration from './pages/WindGeneration';
import SolarGeneration from './pages/SolarGeneration';
import LoadForecast from './pages/LoadForecast';
import OutageSchedule from './pages/OutageSchedule';
import AncillaryServices from './pages/AncillaryServices';
import TransmissionConstraints from './pages/TransmissionConstraints';
import SystemFrequency from './pages/SystemFrequency';
import ReserveCapacity from './pages/ReserveCapacity';
import WeatherZones from './pages/WeatherZones';
import LoadZones from './pages/LoadZones';
import HubPrices from './pages/HubPrices';
import SettlementPoints from './pages/SettlementPoints';
import CongestionRevenue from './pages/CongestionRevenue';
import CapacityDemandCurve from './pages/CapacityDemandCurve';
import ResourceAdequacy from './pages/ResourceAdequacy';
import OperatingReserves from './pages/OperatingReserves';
import EmergencyAlerts from './pages/EmergencyAlerts';
import MarketNotices from './pages/MarketNotices';
import HistoricalData from './pages/HistoricalData';
import Reports from './pages/Reports';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="system-demand" element={<SystemDemand />} />
        <Route path="real-time-prices" element={<RealTimePrices />} />
        <Route path="day-ahead-prices" element={<DayAheadPrices />} />
        <Route path="generation-by-fuel" element={<GenerationByFuel />} />
        <Route path="wind-generation" element={<WindGeneration />} />
        <Route path="solar-generation" element={<SolarGeneration />} />
        <Route path="load-forecast" element={<LoadForecast />} />
        <Route path="outage-schedule" element={<OutageSchedule />} />
        <Route path="ancillary-services" element={<AncillaryServices />} />
        <Route path="transmission-constraints" element={<TransmissionConstraints />} />
        <Route path="system-frequency" element={<SystemFrequency />} />
        <Route path="reserve-capacity" element={<ReserveCapacity />} />
        <Route path="weather-zones" element={<WeatherZones />} />
        <Route path="load-zones" element={<LoadZones />} />
        <Route path="hub-prices" element={<HubPrices />} />
        <Route path="settlement-points" element={<SettlementPoints />} />
        <Route path="congestion-revenue" element={<CongestionRevenue />} />
        <Route path="capacity-demand-curve" element={<CapacityDemandCurve />} />
        <Route path="resource-adequacy" element={<ResourceAdequacy />} />
        <Route path="operating-reserves" element={<OperatingReserves />} />
        <Route path="emergency-alerts" element={<EmergencyAlerts />} />
        <Route path="market-notices" element={<MarketNotices />} />
        <Route path="historical-data" element={<HistoricalData />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;
