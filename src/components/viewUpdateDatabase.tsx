import { useState } from "react";
import Button from "react-bootstrap/Button";

function UpdateDatabase() {
  const [isLoading, setLoading] = useState(false);
  const [span1, setSpan1] = useState("");
  const [span2, setSpan2] = useState("");
  const [span3, setSpan3] = useState("");
  const [span4, setSpan4] = useState("");

  const handleClick1 = () => {
    setSpan1("spinner-border spinner-border-sm");
    setLoading(true);
    fetch("http://localhost:8000/api/update_tickers_prices_cvsfiles", {
      method: "GET",
    }).then((res) => {
      setLoading(false);
      setSpan1("");
    });
  };
  const handleClick2 = () => {
    setSpan2("spinner-border spinner-border-sm");
    setLoading(true);
    fetch("http://localhost:8000/api/update_db_tickers_prices", {
      method: "GET",
    }).then((res) => {
      setLoading(false);
      setSpan2("");
    });
  };
  const handleClick3 = () => {
    setSpan3("spinner-border spinner-border-sm");
    setLoading(true);
    fetch("http://localhost:8000/api/update_options_prices_cvsfiles", {
      method: "GET",
    }).then((res) => {
      setLoading(false);
      setSpan3("");
    });
  };
  const handleClick4 = () => {
    setSpan4("spinner-border spinner-border-sm");
    setLoading(true);
    fetch("http://localhost:8000/api/update_db_options_prices_cvsfiles", {
      method: "GET",
    }).then((res) => {
      setLoading(false);
      setSpan4("");
    });
  };

  return (
    <div className="container">
      <div className="row align-items-top">
        <div className="col-sm-1"></div>

        <div className="col-sm-10 mx-auto">
          <div className="row">
            Load the stock prices from the Internet and write them to CSV files.
            <Button
              variant="outline-primary"
              disabled={isLoading}
              onClick={() => {
                if (!isLoading) handleClick1();
              }}
            >
              <span className={span1}></span>
              {isLoading
                ? " Loading Stock Prices from Internet..."
                : "Load Stock Prices from Internet"}
            </Button>
          </div>
          <div className="row">
            <br></br>Write the tickers CSV files to the database.
            <Button
              variant="outline-primary"
              disabled={isLoading}
              onClick={() => {
                if (!isLoading) handleClick2();
              }}
            >
              <span className={span2}></span>

              {isLoading
                ? " Writing Stock Prices to database..."
                : "Write Stock Prices to database"}
            </Button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-1"></div>

        <div className="col-sm-10 mx-auto">
          <div className="row">
            <br></br>Load the options prices from the Internet and write them to
            CSV files.
            <Button
              variant="outline-primary"
              disabled={isLoading}
              onClick={() => {
                if (!isLoading) handleClick3();
              }}
            >
              {" "}
              <span className={span3}></span>
              {isLoading
                ? "Loading last options prices from Internet..."
                : "Load last options prices from Internet"}
            </Button>
          </div>

          <div className="row">
            <br></br>Write the options CSV files to the database.
            <Button
              variant="outline-primary"
              disabled={isLoading}
              onClick={() => {
                if (!isLoading) handleClick4();
              }}
            >
              {" "}
              <span className={span4}></span>
              {isLoading
                ? "Writing last options prices to database..."
                : "Write last options prices to database"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateDatabase;
