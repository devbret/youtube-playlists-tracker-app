import { createGraph } from "./visualizations/graph.js";
import { createScatterPlot } from "./visualizations/scatterplot.js";
import { createWordCloud } from "./visualizations/wordcloud.js";
import { createBarChart } from "./visualizations/barchart.js";
import { createBarChartTwo } from "./visualizations/simplebarchart.js";
import { createActivityHeatmap } from "./visualizations/heatmap.js";
import { createHorizontalBarChart } from "./visualizations/horizontalbarchart.js";
import { createPieChart } from "./visualizations/piechart.js";
import { createCalendarHeatmap } from "./visualizations/calendarheatmap.js";
import { fillMissingDates } from "../utilities/fillmissingdates.js";

document.addEventListener("DOMContentLoaded", async function () {
  await d3
    .csv("/data/app_log.csv")
    .then(function (data) {
      const dateCounts = {};
      const getCounts = {};
      const youtuberCounts = {};
      const updateCounts = {};
      const deleteCounts = {};
      const searchCounts = {};
      const searchQueries = {};
      const accessedAnalyticsCounts = {};
      const accessedNetworkGraphCounts = {};
      const hourCounts = {};
      const hourlyData = {};
      const dayCounts = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
        Sunday: 0,
      };
      const requestCounts = { GET: 0, POST: 0, PUT: 0, DELETE: 0 };

      const dailyEventCounts = {};

      data.forEach((row) => {
        const { Timestamp, Time, Message } = row;

        const dateStr = (Timestamp || "").trim();
        if (dateStr) {
          if (!dailyEventCounts[dateStr]) dailyEventCounts[dateStr] = 0;
          dailyEventCounts[dateStr]++;
        }

        if (Timestamp && Time) {
          const date = new Date(Timestamp);
          const dayOfWeek = date.toLocaleString("en-us", { weekday: "long" });
          const hour = Time.split(":")[0];
          const key = `${dayOfWeek}-${hour}`;

          if (!hourlyData[key]) {
            hourlyData[key] = 0;
          }
          hourlyData[key]++;
        }

        if (Timestamp) {
          const date = new Date(Timestamp.split(",")[0]);
          const dayOfWeek = date.getDay();

          switch (dayOfWeek) {
            case 0:
              dayCounts.Sunday++;
              break;
            case 1:
              dayCounts.Monday++;
              break;
            case 2:
              dayCounts.Tuesday++;
              break;
            case 3:
              dayCounts.Wednesday++;
              break;
            case 4:
              dayCounts.Thursday++;
              break;
            case 5:
              dayCounts.Friday++;
              break;
            case 6:
              dayCounts.Saturday++;
              break;
          }
        }

        if (Time && Message) {
          const hour = Time.split(":")[0];

          if (!hourCounts[hour]) {
            hourCounts[hour] = 0;
          }
          hourCounts[hour]++;

          const date = Timestamp?.split(",")[0];

          if (Message.includes("Added new playlist")) {
            if (!dateCounts[date]) {
              dateCounts[date] = 0;
            }
            dateCounts[date]++;

            const youtuber = Message.split(" by ")[1];
            if (!youtuberCounts[date]) {
              youtuberCounts[date] = new Set();
            }
            youtuberCounts[date].add(youtuber);
          }

          if (Message.includes("GET request to /api/playlists")) {
            if (!getCounts[date]) {
              getCounts[date] = 0;
            }
            getCounts[date]++;
          }

          if (Message.includes("Updated playlist")) {
            if (!updateCounts[date]) {
              updateCounts[date] = 0;
            }
            updateCounts[date]++;
          }

          if (Message.includes("Deleted playlist")) {
            if (!deleteCounts[date]) {
              deleteCounts[date] = 0;
            }
            deleteCounts[date]++;
          }

          if (Message.includes("Search term used:")) {
            if (!searchCounts[date]) {
              searchCounts[date] = 0;
            }
            searchCounts[date]++;

            const searchTermIndicator = "Search term used: ";
            const startIndex =
              Message.indexOf(searchTermIndicator) + searchTermIndicator.length;
            const searchTerm = Message.substring(startIndex).trim();

            if (searchTerm !== "") {
              if (!searchQueries[searchTerm]) {
                searchQueries[searchTerm] = 1;
              } else {
                searchQueries[searchTerm] += 1;
              }
            }
          }

          if (Message.includes("Accessed analytics page.")) {
            if (!accessedAnalyticsCounts[date]) {
              accessedAnalyticsCounts[date] = 0;
            }
            accessedAnalyticsCounts[date]++;
          }

          if (Message.includes("Accessed network graph page.")) {
            if (!accessedNetworkGraphCounts[date]) {
              accessedNetworkGraphCounts[date] = 0;
            }
            accessedNetworkGraphCounts[date]++;
          }
        }

        if (Message) {
          if (Message.includes("Incoming request: GET")) {
            requestCounts.GET++;
          }
          if (Message.includes("Incoming request: POST")) {
            requestCounts.POST++;
          }
          if (Message.includes("Incoming request: PUT")) {
            requestCounts.PUT++;
          }
          if (Message.includes("Incoming request: DELETE")) {
            requestCounts.DELETE++;
          }
        }
      });

      const filledDateCounts = fillMissingDates(dateCounts);
      const filledGetCounts = fillMissingDates(getCounts);
      const filledYoutuberCounts = fillMissingDates(youtuberCounts);
      const filledUpdateCounts = fillMissingDates(updateCounts);
      const filledDeleteCounts = fillMissingDates(deleteCounts);
      const filledSearchCounts = fillMissingDates(searchCounts);
      const filledAccessedAnalyticsCounts = fillMissingDates(
        accessedAnalyticsCounts,
      );
      const filledAccessedNetworkGraphCounts = fillMissingDates(
        accessedNetworkGraphCounts,
      );

      const filledDailyEventCounts = fillMissingDates(dailyEventCounts);

      createGraph(filledDateCounts, "#graph1", "", "#007bff");
      createGraph(filledGetCounts, "#graph3", "", "#007bff");
      createGraph(filledYoutuberCounts, "#graph4", "", "#007bff");
      createGraph(filledUpdateCounts, "#graph5", "", "#007bff");
      createGraph(filledDeleteCounts, "#graph6", "", "#007bff");
      createGraph(filledSearchCounts, "#graph7", "", "#007bff");
      createGraph(filledAccessedAnalyticsCounts, "#graph8", "", "#007bff");
      createGraph(filledAccessedNetworkGraphCounts, "#graph9", "", "#007bff");
      createScatterPlot(
        updateCounts,
        deleteCounts,
        "#scatterPlot",
        "",
        "#007bff",
        "#eb6834",
        "Updates",
        "Deletions",
      );
      createWordCloud(searchQueries, "#wordCloud");
      createBarChart(hourCounts, "#hourlyActions", "", "#007bff");
      createBarChartTwo(dayCounts, "#weeklyActions", "", "#007bff");
      createActivityHeatmap(hourlyData, "#activityHeatmap");
      createPieChart(requestCounts, "#requestPieChart", "");

      createCalendarHeatmap(filledDailyEventCounts, "#calendarHeatmap");
    })
    .catch(function (error) {
      console.error("Error fetching or parsing data:", error);
    });

  await d3
    .json("/api/playlists")
    .then(function (data) {
      const youtuberPlaylistsMap = new Map();

      data.playlists.forEach((d) => {
        if (!youtuberPlaylistsMap.has(d.youtuber)) {
          youtuberPlaylistsMap.set(d.youtuber, {
            youtuber: d.youtuber,
            count: 0,
          });
        }
        const currentCount = youtuberPlaylistsMap.get(d.youtuber).count;
        youtuberPlaylistsMap.set(d.youtuber, {
          youtuber: d.youtuber,
          count: currentCount + 1,
        });
      });

      const youtuberData = Array.from(youtuberPlaylistsMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 23);

      createHorizontalBarChart(youtuberData);
    })
    .catch(function (error) {
      console.error("Error loading or processing data:", error);
    });
});
