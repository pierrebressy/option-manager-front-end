export const GRAPH_WIDTH = 1000;
export const GRAPH_HEIGHT = 600;
export const MARGIN = { top: 100, right: 50, bottom: 50, left: 10 };

export const X_SCALE_FACTOR = 1.1;

export const STRATEGY_CHART_DEFAULT_SIZE = { width: 1200, height: 600 };
export const STRATEGY_CHART_DEFAULT_MARGIN = {
  top: 30,
  right: 40,
  bottom: 30,
  left: 70,
};

export const TABLE_LIST_ELEMENTS_PER_PAGE = 25;

export const AUTOLOAD_DEFAULT = true;
export const NUM_SHARES_PER_CONTRACT = 100;
export const CONTRACT_MIN_PRICE = 0;
export const CONTRACT_MAX_PRICE = 1000;
export const CONTRACT_MIN_PRICE_SIMULATION = -100;
export const CONTRACT_NUM_POINTS_SIMULATION = 500;
export const DEFAULT_INTEREST_RATE = 0.015; // 1.5%
export const DEFAULT_DIVIDEND_YIELD = 0.0; // 0.0%
export const NUM_TRADE_DAYS = 252;
export const NUM_DAYS_YEAR = 365;

let _strategyDefaultNumContracts = 1;
let _strategyDefaultStrike = 55.0;
let _strategyDefaultStrike1 = 60.0;
let _strategyDefaultStrike2 = 65.0;
let _strategyDefaultPremium = 0.7;
let _strategyDefaultPremium1 = 4;
let _strategyDefaultPremium2 = 2;
let _strategyDefaultImplicitVolatility = 0.17;
let _strategyDefaultNumDays = 39;
let _strategyDefaultCurrentPrice = 65.0;
let _strategyDefaultPRU = 100.5;

//const _strategyDefault: string = "CCS";
//const _strategyDefault: string = "CPS";
//const _strategyDefault: string = "DCS";
//const _strategyDefault: string = "DPS";
//const _strategyDefault: string = "Short";
//const _strategyDefault: string = "Covered Call";
const _strategyDefault: string = "Short Put";

if (_strategyDefault === "CCS") {
  _strategyDefaultNumContracts = 1;
  _strategyDefaultStrike = 55.0;
  _strategyDefaultStrike1 = 60.0;
  _strategyDefaultStrike2 = 65.0;
  _strategyDefaultPremium = 0.7;
  _strategyDefaultPremium1 = 4;
  _strategyDefaultPremium2 = 2;
  _strategyDefaultImplicitVolatility = 0.17;
  _strategyDefaultNumDays = 39;
  _strategyDefaultCurrentPrice = 65.0;
  _strategyDefaultPRU = 100.5;
} else if (_strategyDefault === "CPS") {
  _strategyDefaultNumContracts = 1;
  _strategyDefaultStrike = 45.0;
  _strategyDefaultStrike1 = 45.0;
  _strategyDefaultStrike2 = 50.0;
  _strategyDefaultPremium = 0.7;
  _strategyDefaultPremium1 = 2;
  _strategyDefaultPremium2 = 4;
  _strategyDefaultImplicitVolatility = 0.17;
  _strategyDefaultNumDays = 39;
  _strategyDefaultCurrentPrice = 51.0;
  _strategyDefaultPRU = 50.0;
} else if (_strategyDefault === "DCS") {
  _strategyDefaultNumContracts = 1;
  _strategyDefaultStrike = 45.0;
  _strategyDefaultStrike1 = 50.0;
  _strategyDefaultStrike2 = 60.0;
  _strategyDefaultPremium = 0.7;
  _strategyDefaultPremium1 = 7.5;
  _strategyDefaultPremium2 = 2.5;
  _strategyDefaultImplicitVolatility = 0.17;
  _strategyDefaultNumDays = 39;
  _strategyDefaultCurrentPrice = 51.0;
  _strategyDefaultPRU = 50.0;
} else if (_strategyDefault === "DPS") {
  _strategyDefaultNumContracts = 1;
  _strategyDefaultStrike = 45.0;
  _strategyDefaultStrike1 = 50.0;
  _strategyDefaultStrike2 = 60.0;
  _strategyDefaultPremium = 0.7;
  _strategyDefaultPremium1 = 2.5;
  _strategyDefaultPremium2 = 7.5;
  _strategyDefaultImplicitVolatility = 0.17;
  _strategyDefaultNumDays = 39;
  _strategyDefaultCurrentPrice = 51.0;
  _strategyDefaultPRU = 50.0;
} else if (_strategyDefault === "Covered Call") {
  _strategyDefaultNumContracts = 1;
  _strategyDefaultStrike = 55.0;
  _strategyDefaultStrike1 = 50.0;
  _strategyDefaultStrike2 = 60.0;
  _strategyDefaultPremium = 1;
  _strategyDefaultPremium1 = 2.5;
  _strategyDefaultPremium2 = 7.5;
  _strategyDefaultImplicitVolatility = 0.17;
  _strategyDefaultNumDays = 39;
  _strategyDefaultCurrentPrice = 52.5;
  _strategyDefaultPRU = 50.0;
} else {
  _strategyDefaultNumContracts = 1;
  _strategyDefaultStrike = 50.0;
  _strategyDefaultStrike1 = 50.0;
  _strategyDefaultStrike2 = 50.0;
  _strategyDefaultPremium = 0.7;
  _strategyDefaultPremium1 = 4;
  _strategyDefaultPremium2 = 2;
  _strategyDefaultImplicitVolatility = 0.17;
  _strategyDefaultNumDays = 39;
  _strategyDefaultCurrentPrice = 50.0;
  _strategyDefaultPRU = 50.0;
}

export const DEFAULT_STRATEGY = _strategyDefault;
export const DEFAULT_STRATEGY_NUM_CONTRACTS = _strategyDefaultNumContracts;
export const DEFAULT_STRATEGY_STRIKE = _strategyDefaultStrike;
export const DEFAULT_STRATEGY_STRIKE_1 = _strategyDefaultStrike1;
export const DEFAULT_STRATEGY_STRIKE_2 = _strategyDefaultStrike2;
export const DEFAULT_STRATEGY_PREMIUM = _strategyDefaultPremium;
export const DEFAULT_STRATEGY_PREMIUM_1 = _strategyDefaultPremium1;
export const DEFAULT_STRATEGY_PREMIUM_2 = _strategyDefaultPremium2;
export const DEFAULT_STRATEGY_IMPLICIT_VOLATILITY =
  _strategyDefaultImplicitVolatility;
export const DEFAULT_STRATEGY_NUM_DAYS = _strategyDefaultNumDays;
export const DEFAULT_STRATEGY_CURRENT_PRICE = _strategyDefaultCurrentPrice;
export const DEFAULT_STRATEGY_PRU = _strategyDefaultPRU;
