import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import Recoilize from "recoilize";
import RouterView from "./router";
import { RecoilRoot } from "recoil";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import shadows from "@mui/material/styles/shadows";
import "./i18n";
export const queryClient = new QueryClient();

// import primary from "@mui/material/colors/deepPurple";
const theme = createTheme({
  // shape: {
  //   borderRadius: 8,
  // },
  shadows: shadows.map((item, index) => (index === 2 ? "none" : item)) as any,

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
  palette: {
    primary: {
      main: "#4fc1e9",
      contrastText: "white",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RecoilRoot>
          <Recoilize />
          <RouterView />
        </RecoilRoot>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
