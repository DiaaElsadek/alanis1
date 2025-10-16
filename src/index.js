import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // 👈 استدعاء react-query
import App from "./App";
import { store } from "./redux/store"; // <-- make sure this path is correct
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// 👈 اعمل instance من QueryClient
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <GoogleOAuthProvider clientId="148169998773-ndam87bntioig2832fk6fcunffmrn495.apps.googleusercontent.com">
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  </GoogleOAuthProvider>
);
