import "bootstrap/dist/css/bootstrap.css";
import "./App.css";

import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import PL_risk from "./components/viewPL_risk";
import UpdateDatabase from "./components/viewUpdateDatabase";
import OpenedContracts from "./components/viewOpenedContracts";
import ClosedContracts from "./components/viewClosedContracts";
import OpenedShortPuts from "./components/viewOpenedShortPut";
import TickerView from "./components/viewTicker";
import SectorsView from "./components/viewSectors";
import Strategy from "./components/viewStrategy";

function App() {
  document.title = "Options Manager";

  return (
    <div className="App">
      <header className="App-header">
        <Tabs defaultActiveKey="strategies" id="main-tabs" className="mb-2">
          <Tab eventKey="pl" title="P&L - Risk">
            {PL_risk()}
          </Tab>
          <Tab eventKey="updateData" title="Update database"></Tab>

          <Tab eventKey="opened_contracts" title="Opened contracts"></Tab>

          <Tab eventKey="closed_contracts" title="Closed contracts"></Tab>

          <Tab
            eventKey="opened_contracts_short_put"
            title="Opened Short Puts"
          ></Tab>

          <Tab eventKey="view_ticker" title="View Ticker"></Tab>

          <Tab eventKey="view_sectors" title="Sectors"></Tab>
          <Tab eventKey="strategies" title="Strategies">
            {Strategy("chart-strategies")}
          </Tab>
        </Tabs>
      </header>
    </div>
  );
}

function AppFull() {
  document.title = "Options Manager";

  return (
    <div className="App">
      <header className="App-header">
        <Tabs
          defaultActiveKey="opened_contracts"
          id="main-tabs"
          className="mb-2"
        >
          <Tab eventKey="pl" title="P&L - Risk">
            {PL_risk()}
          </Tab>
          <Tab eventKey="updateData" title="Update database">
            {UpdateDatabase()}
          </Tab>

          <Tab eventKey="opened_contracts" title="Opened contracts">
            {OpenedContracts("chart-opened-contracts")}
          </Tab>

          <Tab eventKey="closed_contracts" title="Closed contracts">
            {ClosedContracts("chart-closed-contracts")}
          </Tab>

          <Tab eventKey="opened_contracts_short_put" title="Opened Short Puts">
            {OpenedShortPuts("chart-opened-short-puts-contracts")}
          </Tab>

          <Tab eventKey="view_ticker" title="View Ticker">
            {TickerView("ticker-view-chart-id")}
          </Tab>

          <Tab eventKey="view_sectors" title="Sectors">
            {SectorsView("chart-view-sectors")}
          </Tab>
          <Tab eventKey="strategies" title="Strategies">
            {Strategy("chart-strategies")}
          </Tab>
        </Tabs>
      </header>
    </div>
  );
}

export default App;
