import React, { Suspense } from "react";
import { useMatch, Outlet } from "react-router-dom";
import SideNav from "./components/SideNav";
import Loading from "@/components/loading";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import shadows from "@mui/material/styles/shadows";
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
    // primary,
  },
});
export const AppSuspenseFallback = () => {
  return (
    <div className="h-screen flex justify-center items-center">
      <Loading />
    </div>
  );
};
function App() {
  const matchedRoute = useMatch("/*");
  return (
    <ThemeProvider theme={theme}>
      <div className="flex">
        {["/flow", "/about", "/functions"].includes(matchedRoute?.pathname || "") && <SideNav />}
        <div className="flex-grow">
          <Suspense fallback={<AppSuspenseFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
