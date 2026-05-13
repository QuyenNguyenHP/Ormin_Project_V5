import { Box, Typography } from "@mui/material";
import Header from "../components/Header";
import NavigationSidebar from "../components/NavigationSidebar";
import Footer from "../components/Footer";
import EngineBarChart from "../components/EngineBarChart";
import { usePolledPagePayload } from "../hooks/usePolledPagePayload";

const Engine = () => {
  const { payload, isLoading, error, lastUpdated, pollIntervalMs } = usePolledPagePayload("engine");
  const barChartData = (payload?.sections?.bar_chart ?? []).map((item) => ({
    name: item.name,
    value: item.value,
  }));
  const summaryItems = payload?.sections?.summary ?? [];
  const statusItems = payload?.sections?.status ?? [];

  return (
    <Box className="h-[1080px] relative bg-[#101828] w-full overflow-hidden shrink-0 flex flex-col items-start leading-[normal] tracking-[normal] mq925:h-auto">
      <Header />
      <main className="self-stretch h-[955px] overflow-hidden shrink-0 flex items-start [row-gap:20px] max-w-full mq1825:flex-wrap">
        <NavigationSidebar />
        <section className="h-[948px] w-[1696px] overflow-hidden shrink-0 flex items-start !p-4 box-border gap-4 max-w-full text-left text-[#f8fafc] font-[Roboto] mq925:h-auto">
          <Box className="min-h-[916px] flex-1 rounded-[10px] bg-[#1e2939] border-[#364153] border-solid border-[1px] box-border overflow-auto flex flex-col items-start !p-8 max-w-full shrink-0">
            
            <Typography
              variant="h2"
              component="h1"
              className="!m-0 text-[32px] font-[Roboto] font-bold text-[#f8fafc]"
            >
              Engine
            </Typography>
            
            <Typography className="!mt-4 !mb-0 text-[14px] text-[#cbd5e1] max-w-[880px]">
              This page loads its chart and summary data from `/api/engine`, which keeps the UI
              component reusable while the backend decides how Modbus registers are mapped.
            </Typography>

            <Box className="mt-8 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 w-full">
              {isLoading ? (
                <Box className="rounded-[12px] bg-[#111827] border border-[#334155] p-5">
                  <Typography className="text-[#fff] font-semibold">Loading engine data...</Typography>
                  <Typography className="text-[#94a3b8] mt-2">
                    Requesting bar chart and summary values from the backend and following its polling interval.
                  </Typography>
                </Box>
              ) : null}

              {!isLoading && error ? (
                <Box className="rounded-[12px] bg-[#111827] border border-[#7f1d1d] p-5">
                  <Typography className="text-[#fecaca] font-semibold">Unable to load engine page</Typography>
                  <Typography className="text-[#fca5a5] mt-2">{error}</Typography>
                </Box>
              ) : null}

              {!isLoading && !error && barChartData.length === 0 ? (
                <Box className="rounded-[12px] bg-[#111827] border border-[#334155] p-5">
                  <Typography className="text-[#fff] font-semibold">No engine chart data configured</Typography>
                  <Typography className="text-[#94a3b8] mt-2">
                    The backend returned no `bar_chart` items for the engine page.
                  </Typography>
                </Box>
              ) : null}

              {!isLoading && !error && barChartData.length > 0 ? (
                <EngineBarChart data={barChartData} title="Cylinder Load Distribution" />
              ) : null}

              <Box className="rounded-[12px] bg-[#111827] border border-[#334155] p-5">
                <Typography className="text-[#fff] font-semibold">Engine Summary</Typography>
                {isLoading ? (
                  <Typography className="text-[#94a3b8] mt-3">Loading summary...</Typography>
                ) : null}

                {!isLoading && error ? (
                  <Typography className="text-[#fca5a5] mt-3">Summary unavailable.</Typography>
                ) : null}

                {!isLoading && !error && summaryItems.length === 0 && statusItems.length === 0 ? (
                  <Typography className="text-[#94a3b8] mt-3">No engine summary configured.</Typography>
                ) : null}

                {!isLoading && !error
                  ? summaryItems.map((item, index) => (
                      <Typography
                        key={item.key}
                        className={index === 0 ? "text-[#94a3b8] mt-3" : "text-[#94a3b8] mt-2"}
                      >
                        {item.label}: {item.value} {item.unit ?? ""}
                      </Typography>
                    ))
                  : null}

                {!isLoading && !error
                  ? statusItems.map((item) => (
                      <Typography key={item.key} className="text-[#94a3b8] mt-2">
                        {item.label}: {item.value ? "On" : "Off"}
                      </Typography>
                    ))
                  : null}
              </Box>
            </Box>
          </Box>
        </section>
      </main>
      <Footer
        lastUpdated={lastUpdated}
        networkStatus={error ? "Disconnected" : payload ? "Connected" : "Connecting..."}
        pollIntervalMs={pollIntervalMs}
      />
    </Box>
  );
};

export default Engine;
