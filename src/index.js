import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { CurrencyProvider } from "./context/CurrencyContext";
import { LocaleProvider } from "./context/LocaleContext";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <CurrencyProvider>
        <LocaleProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LocaleProvider>
      </CurrencyProvider>
    </ChakraProvider>
  </React.StrictMode>
);

reportWebVitals();
