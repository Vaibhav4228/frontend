import { createTheme } from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: "dark", 
    primary: {
      main: "rgb(88,199,250)",
      
    },
    secondary: {
      main: "#5A20CB", 
    },
    black: {
      main: "#242B2E",
    },
    background: {
      main: "#212534",
      default: "#212534",
      paper: "#212534",
    },
    textColor: {
      main: "#111111",
    },
  },
});

export default darkTheme;