const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = 5000;
const axios = require("axios");

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLID,
} = require("graphql");
const graphqlHTTP = require("express-graphql").graphqlHTTP;
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// https://random-data-api.com/api/commerce/random_commerce?size=30

const labels = [
  "Jan",
  "Feb",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const colorBarLine = [
  "pink",
  "green",
  "red",
  "orange",
  "black",
  "blue",
  "orange",
  "pink",
  "maroon",
  "gray",
  "green",
  "purple",
];
const colorPie = ["pink", "orange", "green"];

const ChartDelete = new GraphQLInputObjectType({
  name: "CommerceInput",
  fields: {
    index: {
      type: GraphQLInt,
    },
  },
});
const ChartAddType = new GraphQLInputObjectType({
  name: "CommerceInputString",
  fields: {
    chartTypeItem: {
      type: GraphQLString,
    },
  },
});

const ChartType = new GraphQLObjectType({
  name: "Commerce",
  fields: {
    labels: {
      type: GraphQLList(GraphQLString),
    },
    data: {
      type: GraphQLList(GraphQLInt),
    },
    color: {
      type: GraphQLList(GraphQLString),
    },
  },
});

// initial reset will have 30 data points and call API
let getCommerceApi = async (size = 30) => {
  let axiosItem = await axios.get(
    `https://random-data-api.com/api/commerce/random_commerce?size=${size}`
  );
  let axiosItemArray = axiosItem.data.map(
    ({ id, department, material, color, product_name, price }) => ({
      id,
      department,
      material,
      color,
      product_name,
      price,
    })
  );
  return axiosItemArray;
};
let c;
let d;

// add and delete chart
// add based on argument: line, bar, pie
// delete based on argument: index
const mutationType = new GraphQLObjectType({
  name: "mutation",
  fields: {
    deleteChart: {
      type: GraphQLList(ChartType),
      args: {
        chart: {
          type: ChartDelete,
        },
      },
      resolve: async (_, { chart: { index } }) => {
        d.splice(index, 1);
        return d;
      },
    },
    addChart: {
      type: GraphQLList(ChartType),
      args: {
        chart: {
          type: ChartAddType,
        },
      },
      resolve: async (_, { chart: { chartTypeItem } }) => {
        // if type bar, line, pie > add 12 or 3 > call api to get 12 or 3
        let addNewObj;
        if (chartTypeItem == "bar" || chartTypeItem == "line") {
          //  call api and set object.
          c = await getCommerceApi(12);
          addNewObj = c.reduce(
            (acc, curr, i) => {
              if (i < 12) {
                acc.data.push(parseInt(curr.price));
              }
              return acc;
            },
            { data: [], color: colorBarLine }
          );
          addNewObj.labels = labels;
          c.splice(0, 12);
        } else if (chartTypeItem == "pie") {
          c = await getCommerceApi(3);

          addNewObj = c.reduce(
            (acc, curr, i) => {
              if (i < 3) {
                // pick random color
                // acc.color.push(randomColor());
                acc.data.push(parseInt(curr.price));
                acc.labels.push(curr.product_name);
              }
              return acc;
            },
            { labels: [], data: [], color: colorPie }
          );
          c.splice(0, 3);
        }
        let x = (d = [...d, addNewObj]);
        return x;
      },
    },
  },
});

// query chart based on arguments: line, bar, pie
const queryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    chart: {
      type: GraphQLList(ChartType),
      args: {
        chartType: {
          type: GraphQLList(GraphQLString),
        },
      },
      resolve: async (_, { chartType }) => {
        if (!c) {
          c = await getCommerceApi();
          let totalChart = chartType.map((item) => {
            if (item == "pie") {
              let x = c.reduce(
                (acc, curr, i) => {
                  if (i < 3) {
                    acc.data.push(parseInt(curr.price));
                    acc.labels.push(curr.product_name);
                  }
                  return acc;
                },
                { labels: [], data: [], color: colorPie }
              );
              c.splice(0, 3);
              return x;
            } else if (item == "line" || item == "bar") {
              let x = c.reduce(
                (acc, curr, i) => {
                  if (i < 12) {
                    acc.data.push(parseInt(curr.price));
                  }
                  return acc;
                },
                { data: [], color: colorBarLine }
              );
              x.labels = labels;
              c.splice(0, 12);
              return x;
            }
            return;
          });
          d = totalChart;
          return totalChart;
        } else {
          return d;
        }
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
app.listen(process.env.PORT || 5000);
