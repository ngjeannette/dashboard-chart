import React, { useEffect, useState } from "react";
import Line from "./Line";
import Pie from "./Pie";
import Bar from "./Bar";
import Nav from "./Nav";
import styled from "@emotion/styled";
const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-left: 115px;
  max-width: calc(100% - 115px) !important;
`;
const ChartContainer = styled.div`
  width: calc(50% - 40px);
  display: flex;
  justify-content: center;
  margin: 20px;
`;
const HomeContainer = styled.div`
  display: flex;
`;

// sample data set: for line, pie, pie, bar
// const idealData = [
//   { data: [86, 67, 91, 100, 123, 3, 10, 47, 12, 467, 7, 23], labels: ["Jan", "Feb", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], },
//   { color: ['red', 'blue', 'yellow'], labels: ['a', 'b', 'c'], data: [12, 27, 1] },
//   { color: ['red', 'blue', 'yellow'], labels: ['e', 'f', 'g'], data: [1, 2, 3] },
//   { data: [86, 67, 91, 100, 123, 3, 10, 47, 12, 467, 7, 23], labels: ["Jan", "Feb", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], },
// ];

function Home() {
  const [chartType, setChartType] = useState(["line", "pie", "pie", "bar"]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [save, setSave] = useState(false);

  useEffect(() => {
    // uncomment reset to restart
    reset();
    getChartTypeLocalStorage();
  }, []);

  useEffect(() => {
    if (save) {
      saveToLocalStorage();
    }
  }, [save]);

  // call this to reset the bar chare [line, pie, pie, bar] on localStorage and reset the server.js
  const reset = () => {
    let dataArray = {};
    dataArray["chartType"] = ["line", "pie", "pie", "bar"];
    const stringDataArray = JSON.stringify(dataArray);
    localStorage.setItem("key_chartType", stringDataArray);
  };

  // save current charts to localstorage
  const saveToLocalStorage = () => {
    const identifier = `key_chartType`;
    let dataArray = {};
    dataArray["chartType"] = chartType;
    const stringDataArray = JSON.stringify(dataArray);
    localStorage.setItem(identifier, stringDataArray);
    setSave(false);
  };

  // get chartType from local storage
  function getChartTypeLocalStorage() {
    for (var i = 0; i < localStorage.length; i++) {
      let localStorageValue = localStorage.getItem(localStorage.key(i));
      let localStorageKey = localStorage.key(i);
      if (localStorageKey.includes("chartType")) {
        let storedValue = JSON.parse(localStorageValue);
        if (storedValue["chartType"]) {
          setChartType(storedValue["chartType"]);
          chartQuery();
        }
      }
    }
  }

  //graphql operation
  const chartQuery = async () => {
    const graphqlValue = await graphqlQuery();
    setChartData(graphqlValue.chart);
    setIsLoading(false);
  };

  const graphqlQuery = () => {
    const passArg = JSON.stringify(chartType);
    const query = `
      {
        chart (chartType:${passArg}){
          labels
          data
          color
        }
      }
    `;

    return fetch("/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    })
      .then((r) => {
        return r.json();
      })
      .then((data) => {
        return data.data;
      });
  };

  //graphqlMutation operation to delete
  const chartDelete = async (index) => {
    chartType.splice(index, 1);
    await setChartType(chartType);
    const graphqlValue = await graphqlMutationDelete(index);
    setChartData(graphqlValue.data.deleteChart);
    setSave(true);
  };

  const graphqlMutationDelete = (index) => {
    const passArg = JSON.stringify(index);

    const mutation = `
      mutation {
        deleteChart(chart: {
          index:${passArg}
        }){
          labels
          data
          color
        }
      }
    `;
    return fetch("/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: mutation,
      }),
    })
      .then((r) => {
        return r.json();
      })
      .then((data) => {
        return data;
      });
  };

  //graphqlMutation operation to add
  const chartAdd = async (charTypeItem) => {
    const graphqlValue = await graphqlMutationAdd(charTypeItem);
    setChartData(graphqlValue.data.addChart);
    setChartType([...chartType, charTypeItem]);
    setSave(true);
  };

  const graphqlMutationAdd = (charTypeItem) => {
    const passArg = JSON.stringify(charTypeItem);
    const mutation = `
      mutation {
        addChart(chart: {
          chartTypeItem:${passArg}
        }){
          labels
          data
          color
        }
      }
    `;
    return fetch("/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: mutation,
      }),
    })
      .then((r) => {
        return r.json();
      })
      .then((data) => {
        return data;
      });
  };

  const handleClickAdd = () => {
    let randomNumber = Math.floor(Math.random() * Math.floor(3));
    let allCharts = ["line", "pie", "bar"];
    chartAdd(allCharts[randomNumber]);
  };

  return (
    <HomeContainer>
      <Nav />
      <Container className="container">
        <div
          className="panel panel-heading"
          style={{ width: "100%", height: "55px", boxShadow: "none" }}
        >
          View, Add, Delete Charts
        </div>
        {!isLoading &&
          chartType.length > 0 &&
          chartData.length > 0 &&
          chartType.map((chart, index) => {
            if (chart == "bar") {
              return (
                <ChartContainer key={index}>
                  <Bar data={chartData[index]} />
                  <button
                    className="button is-danger is-outlined"
                    style={{ height: "fit-content" }}
                    onClick={(e) => {
                      chartDelete(index);
                    }}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </ChartContainer>
              );
            } else if (chart == "pie") {
              return (
                <ChartContainer key={index}>
                  <Pie data={chartData[index]} />
                  <button
                    className="button is-danger is-outlined"
                    style={{ height: "fit-content" }}
                    onClick={(e) => {
                      chartDelete(index);
                    }}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </ChartContainer>
              );
            } else if (chart == "line") {
              return (
                <ChartContainer key={index}>
                  <Line data={chartData[index]} />
                  <button
                    className="button is-danger is-outlined"
                    style={{ height: "fit-content" }}
                    key={index}
                    onClick={(e) => {
                      chartDelete(index);
                    }}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </ChartContainer>
              );
            }
          })}
        {!isLoading && chartType.length < 10 && (
          <ChartContainer>
            <button
              className="button is-success is-outlined"
              style={{ width: "100%", height: "100%", minHeight: "157px" }}
              onClick={handleClickAdd}
            >
              <span className="icon is-small">
                <i className="fas fa-plus"></i>
              </span>
              <span>Chart</span>
            </button>
          </ChartContainer>
        )}
      </Container>
    </HomeContainer>
  );
}
export default Home;
